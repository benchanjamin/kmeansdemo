let submitPreviewTemplate = null;
let submitDropzone = null;

function dropzoneInit() {
    submitPreviewTemplate = $("#submit-previews").html();
    $("#submit-template").remove();

    submitDropzone = new Dropzone(".submit-container", { // Make the whole body a dropzone
        url: "/handlePic", // Set the url
        thumbnailWidth: 80,
        autoProcessQueue: false,
        uploadMultiple: true,
        thumbnailHeight: 80,
        maxFiles: 1,
        parallelUploads: 100,
        previewTemplate: submitPreviewTemplate,
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
                // $('#inputFormModal').modal('hide');

                if (myDropzone.files.length) {
                    myDropzone.processQueue();
                    $('#upload-percentage-display').attr('aria-valuenow', '0').css('width', '0' + '%').text(
                        '0%');
                } else {
                    alert("Please upload one image.")
                }
                // } else {
                //     let formData = new FormData(document.getElementById("submit-form"));
                //     $.ajax({
                //         type: 'POST',
                //         url: '/handleFormData',
                //         contentType: false,
                //         dataType: "json",
                //         cache: false,
                //         processData: false,
                //         data: formData,
                //         success: function () {
                //             $('#submit-form').trigger("reset");
                //             fetchEvents();
                //             alert('Your new event has been successfully submitted!');
                //         },
                //         error: function (jqXHR) {
                //             alert(jqXHR.responseJSON.message);
                //         }
                //     })
                // }
            });

            this.on('sending', function (file, xhr, formData) {
                // Append all form inputs to the formData Dropzone will POST
                let data = $("#submit-form").serializeArray();
                $.each(data, function (key, el) {
                    formData.append(el.name, el.value);
                });
            });

            this.on("success", function (files, response) {
                function loadImage(path, target) {
                    $('<img src="' + path + ' "style="width:100%;max-width:310px;margin-top:2%" class="image">')
                        .on('load', function () {
                            $(this).appendTo(target);
                        });
                }
                $('#result-image-container').empty()
                loadImage(response.message, '#result-image-container')
            });

            this.on("error", function (files, response) {
                if (myDropzone.files.length > 1) {
                    // pass
                } else {
                    alert(response.message);
                }
            });
        }
    });
}

// function dropzoneEdit(event_id) {
//     editDropzone.removeAllFiles(true);
//     pic_URLs_for_deletion.length = 0;
//     $("#pic_URLs_for_deletion").val(pic_URLs_for_deletion);
//     let eventMarker = findMarkerByEventID(event_id);
//     let markerEventPictures = eventMarker.get("event_pictures");
//     $.each(markerEventPictures, function (pictureName, pictureURL) {
//         let mockFile = {name: pictureName};
//         editDropzone.options.addedfile.call(editDropzone, mockFile);
//         editDropzone.files.push(mockFile);
//         editDropzone.options.thumbnail.call(editDropzone, mockFile, pictureURL.replace(/^http:\/\//i, 'https://'));
//     })
//     dropzoneEditDelete();
// }
//
// function dropzoneEditDelete() {
//     $(".edit-delete").each(function () {
//         $(this).on("click", function () {
//             let pictureSrc = $(this).parent().parent().find("img").attr("src");
//             pic_URLs_for_deletion.push(pictureSrc);
//             $("#pic_URLs_for_deletion").val(JSON.stringify(pic_URLs_for_deletion));
//         });
//     });
// }

// function notificationWithoutRefresh(wantsSubscribe) {
//     let form = $("form#notification-form")[0]
//     $('#notificationModal').modal('hide');
//     let formData = new FormData(form);
//     if (wantsSubscribe) {
//         $.ajax({
//             type: 'POST',
//             url: '/subscribe',
//             contentType: false,
//             dataType: "json",
//             cache: false,
//             processData: false,
//             data: formData,
//             success: function () {
//                 alert('You have successfully subscribed!')
//             },
//             error: function (jqXHR) {
//                 alert(jqXHR.responseJSON.message);
//             }
//         })
//     } else {
//         $.ajax({
//             type: 'POST',
//             url: '/unsubscribe',
//             contentType: false,
//             dataType: "json",
//             cache: false,
//             processData: false,
//             data: formData,
//             success: function () {
//                 alert('You have successfully unsubscribed!')
//             },
//             error: function (jqXHR) {
//                 alert(jqXHR.responseJSON.message);
//             }
//         })
//     }
// }
