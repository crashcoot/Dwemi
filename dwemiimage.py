import numpy as np
import matplotlib.pylab as plt
from PIL import Image, ImageOps
import time
import scipy.misc

while True:
    # gets image1
    im1 = Image.open("html/images/stomachImages/background.jpg")
    im1 = np.asarray(im1)
    im1 = im1[:, :, :3]

    # gets image2
    im2 = Image.open("html/images/stomachimages/test.jpg")
    im2 = ImageOps.fit(im2, (200,200)) # resizes and crops to 200X200
    im2 = np.asarray(im2)
    im2 = im2[:, :, :3]

    # image2 dimmensions
    im2Height, im2Width, _ = im2.shape

    # mask for choosing chunks of each image
    mask = np.random.binomial(1, 0.98, size=(40,40))    # creates 40x40 array of 1 or 0, 1 for im1 0 for im2
    mask = mask.repeat(5, axis=0).repeat(5, axis=1)     # repeats the mask to be 200x200
    mask = np.expand_dims(mask, axis=-1)                # adds 3rd dimmension to be broadcastable with imgs

    # new image make from im1 and im2 spliced by masking condition
    newim = np.where(mask, im1, im2)

    scipy.misc.imsave('html/images/stomachImages/background.jpg', newim)
    print("Done")
    time.sleep(5)
