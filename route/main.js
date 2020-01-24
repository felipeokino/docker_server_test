// const {storage} = require("../../../src/utils/firebase/")
const express = require("express");
const fs = require("fs");
// const Big = require('big.js');
const { exec } = require('child_process');

// Instance of Router
const route = express.Router();

// Importing firebase 
const { FRD, FStg, FRStore } = require("../config/firebase");

route.get("/file", async (request, response) => {
    let vet = [];
    const files = await FRD.ref("files").once("value");
    if (files.val()) {
        for (let f in files.val()) {
            vet.push(files.val()[f]);
        }
    }
    response.status(200).send({ msg: vet })
});

route.post("/upload", async (request, response) => {
    if (Object.keys(request.files).length === 0) {
        return request.status(400).send('No files were uploaded.');
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = request.files.sampleFile;
    const name = sampleFile.name.split(".");
    const ext = name[name.length - 1];
    const ref = FRD.ref("files").push();
    await ref.set({
        id: ref.key,
        name: sampleFile.name,
        ext
    });
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./temp/' + ref.key + "." + ext, (err) => {
        if (err)
            return response.status(500).send({ msg: err });
        // Uploading to Firebase Storage

        FStg.upload('./temp/' + ref.key + "." + ext, {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            gzip: true
        })
            .then(() => {
                response.status(200).send({ msg: ref.key + '.' + ext });
            })
            .catch(err => response.status(500).send({ msg: err }));
    });
    // response.status(200).send({ msg: ref.key + '.' + ext });
});

const _execPython = (path, cmd, ext) => {
    return new Promise((resolve,reject)=>{
        exec("python3 ./route/script.py --input=" + path + " --command=" + cmd + " --ext=" + ext, (error, stdout, stderr) => {
            if (!error) {
                resolve(stdout)
            } else {
                reject("Erro na execução do python:" + stderr);
            }
        });
    })
}

route.post("/metadata/:instance", (req, res) => {
    if (Object.keys(req.files).length === 0) {
        return req.status(400).send('No files were uploaded.');
    }
    let sampleFile = req.files.sampleFile;
    const name = sampleFile.name.split(".");
    const ext = name[name.length - 1];
    let ref = FRStore.collection('instance_data').doc(req.params.instance).collection('csvs').doc();
    // let ref = FRStore.collection('instance_data').doc(req.params.instance).collection('csvs').doc();
    // const ref = FRD.ref("files").push();
    const newFileName = ref.id + "." + ext;
    const path = './temp/' + newFileName;
    sampleFile.mv(path, async (err) => {
        try {
            if (err)
                throw new Error(err);
            let resp = await _execPython(path, 'upload', ext);
            resp = JSON.parse(resp);
            const obj = {
                id: ref.id,
                name: sampleFile.name,
                ext,
                header: resp['headers'],
                uniques: resp['uniques'],
                modifiedDate: new Date()
            };
            await ref.set(obj);
            await FStg.upload(path, { gzip: true });
        } catch(error) {
            console.error(error);
            res.status(500).send({ msg: error });
        }
    });

});

route.get("/procedure/:filename/:column", (request, response) => {
    let file = request.params.filename.split('.');

    fs.exists("./temp/" + request.params.filename, async exists => {
        if (!exists)
            await FStg.file(request.params.filename).download({ destination: "./temp/" + request.params.filename });
        // let column = request.params.column.replace(' ', '_');
        // Python Script
        exec("python3 ./route/script.py --input=./temp/" + request.params.filename + " --command=unique --column=" + request.params.column + " --ext=" + file[1], (error, stdout, stderr) => {
            if (!error)
                response.status(200).send({ msg: JSON.parse(stdout) });
            else
                return response.status(500).send({ msg: stderr });
        });
    })
});
// Get Headers
route.get('/headers/:filename', (req, res) => {
    let file = req.params.filename.split('.');
    fs.exists("./temp/" + req.params.filename, async exists => {
        if (!exists)
            await FStg.file(req.params.filename).download({ destination: "./temp/" + req.params.filename });
        // Python Script
        exec("python3 ./route/script.py --input=./temp/" + req.params.filename + " --command=header --ext=" + file[1], (error, stdout, stderr) => {
            if (!error) {
                return res.status(200).send({ msg: JSON.parse(stdout) });
            } else
                return res.status(500).send({ msg: stderr });
        });
    })
});

// Get Data
route.post('/data1/:filename', (req, res) => {
    let file = req.params.filename.split('.');

    fs.exists("./temp/" + req.params.filename, async exists => {
        if (!exists)
            await FStg.file(req.params.filename).download({ destination: "./temp/" + req.params.filename });
        let body = JSON.parse(req.body.test);
        // Python Script
        exec("python3 ./route/script.py --input=./temp/" + req.params.filename + " --command=cat --column=" + body.column + " --rows=" + body.rows + " --filter='" + body.data + "' --ext=" + file[1], (error, stdout, stderr) => {
            if (!error) {
                return res.status(200).send({ msg: JSON.parse(stdout) });
            }
            else
                return res.status(500).send({ msg: stderr });
        });
    });
});

route.post('/data2/:filename', (req, res) => {
    let file = req.params.filename.split('.');
    fs.exists("./temp/" + req.params.filename, async exists => {
        if (!exists)
            await FStg.file(req.params.filename).download({ destination: "./temp/" + req.params.filename });
        let body = JSON.parse(req.body.test);
        // Python Script
        exec("python3 ./route/script.py --input=./temp/" + req.params.filename + " --command=cat --column=" + body.column + " --rows=" + body.rows + " --filter='" + body.data + "' --ext=" + file[1], (error, stdout, stderr) => {
            if (!error) {
                return res.status(200).send({ msg: JSON.parse(stdout) });
            }
            else
                return res.status(500).send({ msg: stderr });
        });
    });
});

route.delete("/save/:filename", (request, response) => {
    fs.unlink('temp/' + request.params.filename, (err) => {
        if (err) throw err;
        fs.unlink('temp/' + request.params.filename + ".json", (err) => {
            if (err) throw err;
            response.send({ msg: 'File closed!' });
        });
    });
});

module.exports = route;