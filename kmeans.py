import numpy as np
from flask_socketio import SocketIO, emit

LABEL_MAP = {
    0: [255, 0, 0],
    1: [0, 255, 0],
    2: [0, 0, 255],
    3: [255, 255, 0],
    4: [255, 0, 255],
    5: [0, 255, 255],
    6: [255, 255, 255],
    7: [255, 157, 0],
    8: [0, 157, 255],
    9: [255, 0, 157],
}


# Returns the euclidean distance of numpy row and centroids (helper)
def euclidean_distance(points, centroids):
    # shape of (1, width * height, 3)
    reshaped_points = points[np.newaxis, :, :]
    # shape of (K, 1, 3)
    reshaped_centroids = centroids[:, np.newaxis, :]
    # Returns the resulting shape of (K, width * height, 1)
    return np.sum(np.square(np.subtract(reshaped_points, reshaped_centroids)), axis=2)


# Returns the index with the minimum value of each column of the first dimension (axis = 0)
def closest_to_centroid(points, centroids_array):
    distances_to_centroids = euclidean_distance(points, centroids_array)
    indices_closest_to_centroids = np.argmin(distances_to_centroids, axis=0)
    # Returns the resulting shape of (1, width * height, 1)
    return indices_closest_to_centroids


def kmeans(x, k, niter, socket_io):
    """
    x: array of shape (N, D)
    K: integer
    niter: integer
    centroids: array of shape (K, D)
    labels: array of shape (height*width, )
    """

    np.random.seed(123)
    idx = np.random.choice(len(x), k, replace=False)

    # Randomly choose centroids
    centroids = x[idx, :]

    # Initialize to hold indices
    min_k_indices = None

    progress = 10
    interval = 90 / niter

    # loop for niter iterations
    for itr in range(niter):
        min_k_indices = closest_to_centroid(x, centroids)
        for i in range(k):
            clustered_x = x[min_k_indices == i]
            new_centroid_row = np.mean(clustered_x, axis=0)
            centroids[i] = new_centroid_row
        progress += interval
        socket_io.emit('upload_progress', progress)

    # Initialize labels
    labels = min_k_indices

    for i in range(len(centroids)):
        if i not in LABEL_MAP:
            centroids[i] = [0, 0, 0]
        else:
            centroids[i] = LABEL_MAP[i]

    labels = np.int8(labels)

    return labels, centroids
