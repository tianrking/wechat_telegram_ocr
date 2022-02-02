from fastapi import FastAPI, File, UploadFile
from matplotlib import pyplot as plt
from PIL import Image
# import tensorflow as tf
import paddlehub as hub
import cv2
import json

ocr = hub.Module(name="chinese_ocr_db_crnn_server")
#ocr = hub.Module(name="chinese_ocr_db_crnn_mobile")

# import tensorflow_hub as tf_hub
# detector = tf_hub.load("https://tfhub.dev/tensorflow/faster_rcnn/inception_resnet_v2_640x640/1")
# detector_output = detector(image_tensor)
# class_ids = detector_output["detection_classes"]

app = FastAPI()

import multipart #import decoders
#from multipart.decoders import Base64Decoder
#multipart.decoder

@app.post("/files/")
async def create_file(file: bytes = File(...)):
    return {"file_size": len(file)}


@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    return {"filename": file.filename}

@app.post("/pic/")
async def create_upload_img(file: UploadFile):
    print(file.filename)
    _dir_name="/storage/lol/wechaty/getting-started/media/"+str(file.filename)
    # #file.write("/storage/lol/wechaty/getting-started/src/"+str(file.filename))
    res =  await file.read()
    with open(_dir_name,"wb") as f:
        f.write(res)
    result = ocr.recognize_text(images=[cv2.imread(_dir_name)])
    #send_data = json.loads(result)
    gg=[]
    for _message in result[0]['data']:
        gg.append(_message['text'])
    print(gg)
    return gg

    # decoder = Base64Decoder(file.file)
    # decoder.encode(file.)
    #original_image = Image.open(file.file)
    #original_image.show() 
    #print(file.file)
    

    #return {"filename": file.filename}