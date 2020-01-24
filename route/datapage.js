const express = require("express");
const fs = require("fs");
// const Big = require('big.js');
const { exec } = require('child_process');

// Instance of Router
const route = express.Router();

// Importing firebase 
const { FRD, FStg, FRStore } = require("../config/firebase");

route.post("/openfile", async (request, response) => {
    if (Object.keys(request.files).length === 0) {
        return request.status(400).send('No files were uploaded.');
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = request.files.sampleFile;
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./temp/' + sampleFile.name, (err) => {
        if (err)
            return response.status(500).send({ msg: err });

        response.status(200).send({ msg: sampleFile.name + " CARREGADO" });
    });
});
route.post("/getdigit", async (req, res) => {
    const { filename, target_col, source_col, index, def } = JSON.parse(req.body.test);

    exec("python ./route/datapage.py --input=./temp/" + filename + " --command=getDigit --targetcol=" + target_col + " --sourcecol=" + source_col + " --def=" + def + " --name=" + filename + " --index=" + index, (error, stdout, stderr) => {
        if (!error) {
            res.status(200).send({ msg: "COLUNA " + target_col + " CRIADA E POPULADA!!!!!" })
        } else
            return res.status(500).send({ msg: stderr });
    });
})
route.post("/depara", async (req, res) => {
    const { filename, target_col, source_col, depara_filename, def } = JSON.parse(req.body.test);
    exec("python ./route/datapage.py --input=./temp/" + filename + " --command=depara --targetcol=" + target_col + " --sourcecol=" + source_col + " --depara=./temp/" + depara_filename + " --def=" + def, (error, stdout, stderr) => {
        if (!error) {
            res.status(200).send({ msg: "COLUNA " + target_col + " CRIADA E POPULADA!!!!!" })
        } else
            return res.status(500).send({ msg: stderr });
    });
})
route.get("/getif", (req, res) => {
    const { filename, target_col, src1, src2, type, col, op, val } = req.body.test;
    let cond = { 'type': type, 'col': col, 'op': op, 'val': val };
    exec("python ./route/datapage.py --input=./temp/" + filename + " --command=getif --targetcol=" + target_col + " --src1=" + src1 + " --src2=" + src2 + " --cond='" + JSON.stringify(cond) + "'", (error, stdout, stderr) => {
        if (!error) {
            res.status(200).send(stdout)
        } else
            return res.status(500).send({ msg: stderr });
    });
})
route.post("/getdate", async (req, res) => {
    const { filename, target_col, source_col, date_format } = JSON.parse(req.body.test);
    exec("python ./route/datapage.py --input=./temp/" + filename + " --command=getdate --targetcol=" + target_col + " --sourcecol=" + source_col + " --dateformat=" + date_format, (error, stdout, stderr) => {
        if (!error) {
            res.status(200).send({ msg: "COLUNA " + target_col + " CRIADA E POPULADA!!!!!" })
        } else
            return res.status(500).send({ msg: stderr });
    });
})
module.exports = route;