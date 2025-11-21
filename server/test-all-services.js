const axios = require('axios');

async function testAllServices() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 Testing NeuraCare System Integration');
    console.log('='.repeat(60) + '\n');

    const services = [
        { name: 'Eye Disease', port: 8001 },
        { name: 'Mental Health', port: 8002 },
        { name: 'Public Health', port: 8003 },
        { name: 'Cognitive Health', port: 8004 },
        { name: 'Backend Server', port: 5000 }
    ];

    for (const service of services) {
        try {
            const response = await axios.get(`http://localhost:${service.port}`);
            console.log(`✅ ${service.name} (${service.port}): RUNNING`);
            console.log(`   Response:`, response.data.service || response.data.message);
        } catch (error) {
            console.log(`❌ ${service.name} (${service.port}): FAILED`);
            console.log(`   Error: ${error.message}`);
        }
    }

    // Test Mental Health Intent Classification
    console.log('\n' + '-'.repeat(60));
    console.log('🧠 Testing Mental Health Intent Classification...');
    try {
        const response = await axios.post('http://localhost:8002/classify', {
            text: "I'm feeling sad and hopeless"
        });
        console.log('✅ Intent Classification Working!');
        console.log(`   Intent: ${response.data.intent}`);
        console.log(`   Confidence: ${response.data.confidence}`);
    } catch (error) {
        console.log('❌ Intent Classification Failed:', error.message);
    }

    // Test Public Health RAG
    console.log('\n' + '-'.repeat(60));
    console.log('🏥 Testing Public Health RAG...');
    try {
        const response = await axios.post('http://localhost:8003/ask', {
            question: "What is glaucoma?"
        });
        console.log('✅ RAG Service Working!');
        console.log(`   Answer: ${response.data.answer.substring(0, 100)}...`);
    } catch (error) {
        console.log('❌ RAG Service Failed:', error.message);
    }

    // Test COVID Stats
    console.log('\n' + '-'.repeat(60));
    console.log('🦠 Testing COVID-19 Stats...');
    try {
        const response = await axios.get('http://localhost:8003/covid/India');
        console.log('✅ COVID Stats Working!');
        console.log(`   Total Cases: ${response.data.total_cases.toLocaleString()}`);
        console.log(`   Active Cases: ${response.data.active_cases.toLocaleString()}`);
    } catch (error) {
        console.log('❌ COVID Stats Failed:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 System Integration Test Complete!');
    console.log('='.repeat(60) + '\n');
}

testAllServices();
