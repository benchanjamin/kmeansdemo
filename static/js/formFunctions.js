let submitPreviewTemplate = null;
let submitDropzone = null;
let uploadCanceled = false;
let dropzoneFileCopy = null;

function dropzoneInit() {
    submitPreviewTemplate = $("#submit-previews").html();
    $("#submit-template").remove();

    Dropzone.prototype.cancelUpload = function () {
        //pass
    }
    submitDropzone = new Dropzone(".submit-container", { // Make the whole body a dropzone
        url: "/handlePic", // Set the url
        thumbnailWidth: 80,
        autoProcessQueue: false,
        uploadMultiple: true,
        thumbnailHeight: 80,
        maxFiles: 1,
        parallelUploads: 100,
        previewTemplate: submitPreviewTemplate,
        acceptedFiles: ".jpeg,.jpg,.png,.heic",
        previewsContainer: "#submit-previews", // Define the container to display the previews
        clickable: ".fileinput-submit-button", // Define the element that should be used as click trigger to select files.,
        // The setting up of the dropzone
        init: function () {
            let myDropzone = this;

            myDropzone.on("maxfilesexceeded", function (file) {
                myDropzone.removeAllFiles();
                myDropzone.addFile(file);
            })

            // First change the button to actually tell Dropzone to process the queue.
            $("#submitImage").on("click", function (e) {
                // Make sure that the form isn't actually being sent.
                e.preventDefault();
                $('#result-image-container').empty();
                uploadCanceled = false

                if (myDropzone.files.length) {
                    myDropzone.processQueue();
                    $('#upload-percentage-display').attr('aria-valuenow', '0').css('width', '0' + '%');
                } else {
                    alert("Please upload one image.")
                }
            });

            this.on('sending', function (file, xhr, formData) {
                // Append all form inputs to the formData Dropzone will POST
                let data = $("#submit-form").serializeArray();
                $.each(data, function (key, el) {
                    formData.append(el.name, el.value);
                });
                dropzoneFileCopy = myDropzone.files.slice(0)[0];
                myDropzone.removeAllFiles(true);
            });

            this.on("success", function (files, response) {
                function loadImage(path, target) {
                    $('<img src="' + path + ' "style="width:100%;max-width:500px;%" class="image">')
                        .on('load', function () {
                            $(this).appendTo(target);
                        });
                }

                myDropzone.addFile(dropzoneFileCopy);
                $('#result-image-container').empty();
                loadImage(response.message, '#result-image-container');
            });

            this.on("error", function (files, response) {
                if (myDropzone.files.length > 1) {
                    // pass
                } else if (myDropzone.files.length === 1 && response === 'You can not upload any more files.') {
                    // pass
                } else if (response === 'Upload canceled.') {
                    // pass
                } else {
                    alert(response.message);
                    $('#upload-percentage-display').attr('aria-valuenow', '0').css('width', '0' + '%')
                    myDropzone.removeAllFiles(true);
                    myDropzone.addFile(dropzoneFileCopy);
                }
            });
        }
    });
}