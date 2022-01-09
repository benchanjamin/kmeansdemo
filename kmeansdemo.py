from flask import Flask, render_template, make_response, request, jsonify
import os
from flask_socketio import SocketIO, emit
from kmeans import kmeans
import cloudinary
import cloudinary.uploader as cloud_upload
import cv2
import numpy as np

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
socket_io = SocketIO(app)


@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def index():
    html = render_template("index.html")
    response = make_response(html)
    return response


@app.route('/handlePic', methods=['POST'])
def handle_pic():
    try:
        number_of_segments = int(request.form.get("segments"))
        number_of_iterations = int(request.form.get("iterations"))
    except ValueError:
        message = "Please enter int values for '# of Segments' and '# of Iterations.'"
        return jsonify(message=message), 400
    if not number_of_segments or not (1 <= number_of_segments <= 9):
        message = "Please enter an int value for '# of Segments' between 1 inclusive and 9 inclusive."
        return jsonify(message=message), 400
    if not number_of_iterations or not (1 <= number_of_iterations <= 100):
        message = "Please enter an int value for '# of Iterations' between 1 inclusive and 100 inclusive."
        return jsonify(message=message), 400

    picture_to_be_segmented = request.files.to_dict().values()
    if len(picture_to_be_segmented) > 1:
        message = "You added more than one picture. Please submit only one image."
        return jsonify(message=message), 400
    if len(picture_to_be_segmented) == 0:
        message = "Please submit an image."
        return jsonify(message=message), 400
    for pic in picture_to_be_segmented:
        ALLOWED_EXTENSIONS_LOWER = {'png', 'jpg', 'jpeg', 'heic'}

        def allowed_file_lower(filename):
            return '.' in filename and filename.rsplit(
                '.', 1)[1].lower() in ALLOWED_EXTENSIONS_LOWER

        if not allowed_file_lower(pic.filename):
            message = "Please submit an image file."
            return jsonify(message=message), 400

        cloudinary.config(
            cloud_name=os.getenv("CLOUD_NAME"),
            api_key=os.getenv("API_KEY"),
            api_secret=os.getenv("API_SECRET")
        )
        filestr = pic.read()
        npimg = np.fromstring(filestr, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        # Convert from default BGR channels to RGB channels
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        height, width, number_of_channels = img.shape
        scale = 500 / max(height, width)  # The longer side will be resized to 500
        img = cv2.resize(img, (int(width * scale), int(height * scale)))

        # Vector the image to one-dimension
        x = img.reshape((-1, 3)).astype(np.float32)

        labels, centroids = kmeans(x, number_of_segments, number_of_iterations, socket_io)
        result = centroids[labels.flatten()]
        result_image = result.reshape(img.shape)

        _, jpeg = cv2.imencode('.jpeg', result_image)
        upload_result = cloud_upload.upload(jpeg.tobytes())
        url_http = upload_result['url']
        url_https = url_http.replace('http://', 'https://')
        message = url_https
        return jsonify(message=message, success=True)
    
if __name__ == "__main__":
    socket_io.run(app)
