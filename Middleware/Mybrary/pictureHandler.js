const imageMimeTypes = ["image/jpeg", "image/png", "images/gif", "image/jpg"]

function saveCover(book, encodedCover) {
    if (!encodedCover) return
    try {
        const cover = JSON.parse(encodedCover)
        if (cover && imageMimeTypes.includes(cover.type)) {
            book.coverimage = Buffer.from(cover.data, "base64")
            book.coverimagetype = cover.type
        } else {
            console.error('Invalid cover data or unsupported image type');
        }
    } catch (error) {
        console.error('Error parsing encodedCover:', error);
        // Handle the error as needed
    }
}

function BinaryToImage(image, imageType) {
    if (image && imageType) {
        // console.log(`data:${imageType};base64,${image.toString("base64")}`);
        return `data:${imageType};base64,${image.toString("base64")}`;
    }
    return null; // oder einen anderen Wert, um den fehlenden Fall zu behandeln
}

module.exports = {saveCover, BinaryToImage}