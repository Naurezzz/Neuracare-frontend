const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Blockchain, Block } = require('./blockchain');

const app = express();
const PORT = 3001; 

// Middleware
app.use(cors()); // Allows frontend to talk to backend
app.use(bodyParser.json());

const vitalChain = new Blockchain();

app.get('/api/chain', (req, res) => {
    res.json({
        chain: vitalChain.chain,
        length: vitalChain.chain.length
    });
});

app.post('/api/record', (req, res) => {
    const { patientId, disease, confidence } = req.body;

    if (!patientId || !disease) {
        return res.status(400).json({ error: "Missing data" });
    }

    const newBlockData = {
        patientId,
        disease,
        confidence,
        timestamp: new Date().toISOString()
    };

    const newBlock = new Block(
        vitalChain.chain.length,
        new Date().toISOString(),
        newBlockData
    );

    vitalChain.addBlock(newBlock);

    console.log(`[BLOCK ADDED] Hash: ${newBlock.hash}`);

    res.json({
        message: "Block added successfully",
        block: newBlock
    });
});

app.listen(PORT, () => {
    console.log(`🔗 Blockchain Server running on http://localhost:${PORT}`);
});