require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
  try {
    console.log('🧪 Probando conexión con OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user", 
          content: "write a haiku about ai"
        }
      ],
      max_tokens: 100
    });

    console.log('✅ Conexión exitosa!');
    console.log('📝 Respuesta de OpenAI:');
    console.log(response.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Error con OpenAI:', error.message);
    
    if (error.status === 401) {
      console.log('🔑 API key inválida');
    } else if (error.status === 429) {
      console.log('💳 Sin créditos o cuota excedida');
    } else if (error.status === 404) {
      console.log('🚫 Modelo no encontrado');
    }
  }
}

testOpenAI();