import numpy as np
import matplotlib.pylab as plt
from skimage import measure
import random
import time
import scipy.misc

while True:

    im1 = plt.imread("html/images/stomachImages/background.jpg")
    im1 = im1[:, :, :3] #sometimes the image as a shape of (200, 200, 4), which can't concatenate with (200, 200, 3), so it makes it 3

    im2 = plt.imread("html/images/stomachimages/test.jpg")
    im2 = im2[:, :, :3]


    im2Height = np.shape(im2)[0] #gets the first dimension length
    im2Width = np.shape(im2)[1] #gets the second dimension length

    #trims im2 to be a 200x200, using the middle of the image
    im2 = im2[int(im2Height/2-100):int(im2Height/2+100), int(im2Width/2-100):int(im2Width/2+100), ]



    im_array1 = np.split(im1, 40, 1) #creates an array of 5px columns
    y_im_array1 = np.split(im_array1[0], 40) #splits the first column into an array of 5x5 chunks

    #Same as above but from image 2
    im_array2 = np.split(im2, 40, 1) 
    y_im_array2 = np.split(im_array2[0], 40)

    newim = y_im_array2[0] #temp array
    #Finishes the first column so the loop later can concatenate to it
    for i in range(1, 40): 
        if (random.randint(0,100) > 98):
            newim = np.concatenate((newim, y_im_array2[i]), axis=0)
        else:
            newim = np.concatenate((newim, y_im_array1[i]), axis=0)
    
    for x in range(1, 40):
        y_im_array1 = np.split(im_array1[x], 40) #Splits column x horizontally
        y_im_array2 = np.split(im_array2[x], 40) #Splits column x horizontally
        yim = y_im_array2[0] #temp array to swap chunks into
        for y in range(1, 40):
            if (random.randint(0,100) > 98): # 2% chance yim gets the chunk from the second image
                yim = np.concatenate((yim, y_im_array2[y]), axis=0)
            else:
                yim = np.concatenate((yim, y_im_array1[y]), axis=0)
        newim = np.concatenate((newim, yim), axis=1) #combine the new column with all the columns from before



    scipy.misc.imsave('html/images/stomachImages/background.jpg', newim)
    print("Done")
    time.sleep(5)