import numpy as np
import matplotlib.pylab as plt
from skimage import measure
import random
import time


x_sq = 10
y_sq = 10

while True:

    im1 = plt.imread("html/images/stomachImages/background.jpg")
    im1 = im1[:, :, :3]

    im2 = plt.imread("html/images/stomachimages/test.jpg")
    im2 = im2[:, :, :3]


    im2Height = np.shape(im2)[0]
    im2Width = np.shape(im2)[1]

    heightTrim = im2Height%10
    widthTrim = im2Width%10

    im2 = im2[int(im2Height/2-90):int(im2Height/2+90), int(im2Width/2-50):int(im2Width/2+50), ]



    im_array1 = np.split(im1, 20, 1)
    y_im_array1 = np.split(im_array1[0], 36)

    im_array2 = np.split(im2, 20, 1)
    y_im_array2 = np.split(im_array2[0], 36)

    newim = y_im_array2[0]
    for i in range(1, 36):
        if (random.randint(0,100) > 98):
            newim = np.concatenate((newim, y_im_array2[i]), axis=0)
        else:
            newim = np.concatenate((newim, y_im_array1[i]), axis=0)
    
    try:
        for x in range(1, 20):
            y_im_array1 = np.split(im_array1[x], 36)
            y_im_array2 = np.split(im_array2[x], 36)
            yim = y_im_array2[0]
            for y in range(1, 36):
                if (random.randint(0,100) > 98):
                    yim = np.concatenate((yim, y_im_array2[y]), axis=0)
                else:
                    yim = np.concatenate((yim, y_im_array1[y]), axis=0)
            newim = np.concatenate((newim, yim), axis=1)
    except:
        print("Image not compatible")


    plt.imshow(newim, interpolation='nearest')
    plt.axis("off")
    plt.xticks([])
    plt.yticks([])
    plt.tight_layout()
    import scipy.misc
    scipy.misc.imsave('html/images/stomachImages/background.jpg', newim)
    print("Done")
    time.sleep(10)