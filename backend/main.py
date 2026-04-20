from fastapi import FastAPI
from environment import Environment
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def read_root():   
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int , q:str | None = None):
    return {"item_id": item_id, "q": q}

#frontend initializes new environment 
#based on: algo, env size 
class SimOptions (BaseModel):
    algorithm: str
    size: int # the env is gonna be a squre thats at least 2 
     
    
@app.put("/init/")
def init_sim(options: SimOptions):
    return {"algo": options.algorithm, "size": options.size }