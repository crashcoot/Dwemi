import numpy as np
import matplotlib.pylab as plt
from PIL import Image, ImageOps
import time

IMAGE_SIZE = (400,400)
BLOCK_SIZE = 5

# dimension compatibility check
if (IMAGE_SIZE[0]%BLOCK_SIZE != 0) or (IMAGE_SIZE[1]%BLOCK_SIZE != 0):
    raise ValueError(f"Image size setting {IMAGE_SIZE} not compatible with block size {BLOCK_SIZE}")

BLOCK_MATRIX = (int(IMAGE_SIZE[0]/BLOCK_SIZE), int(IMAGE_SIZE[1]/BLOCK_SIZE))

def block_replace(im1, im2):
    """replaces im1 with im2 through block replacement
    returns new image
    """
    # mask for choosing chunks of each image
    mask = np.random.binomial(1, 0.98, size=BLOCK_MATRIX)    # creates 40x40 array of 1 or 0, 1 for im1 0 for im2
    mask = mask.repeat(BLOCK_SIZE, axis=0).repeat(BLOCK_SIZE, axis=1)     # repeats the mask to be 200x200
    mask = np.expand_dims(mask, axis=-1)                # adds 3rd dimmension to be broadcastable with imgs

    # new image make from im1 and im2 spliced by masking condition
    newim = np.where(mask, im1, im2)
    return newim

def avg_fade(im1, im2):
    """fades im2 into im1 through averaging
    returns new image
    """
    newim = np.round((im1*0.98 + im2 *0.02)/2)
    newim = newim.astype(np.uint8)
    return newim

# gets image1
im1 = Image.open("html/images/stomachImages/background.jpg")
im1 = np.asarray(im1)
im1 = im1[:, :, :3]

# gets image2
im2 = Image.open("html/images/stomachimages/stomach.jpg")
im2 = ImageOps.fit(im2, IMAGE_SIZE) # resizes and crops to 200X200
im2 = np.asarray(im2)
im2 = im2[:, :, :3]

newim = block_replace(im1, im2)

newim.save('html/images/stomachImages/background.jpg')
print("Done")
