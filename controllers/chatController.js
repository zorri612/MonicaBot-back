const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sendMessage = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId); // ✅ obtenemos nombre
    const userName = user.name;

    // Guardar mensaje del usuario
    await ChatMessage.create({ userId, sender: 'user', message });

    // Obtener historial breve para contexto (máximo 20 últimos mensajes)
    const history = await ChatMessage.find({ userId }).sort({ timestamp: 1 }).limit(20);

    const messages = [
  {
    role: 'system',
    content: `Eres una tendera de una ferretería en la ciudad de Cali, Colombia. 
      Te llamas Mónica Rodríguez. Vendes herramientas básicas para la reparación del hogar. 
      Tienes 28 años. Eres muy seca para responder, muy cortante, como si la vida te tratara de la peor manera. 
      Estuviste en la cárcel por un homicidio culposo hace 8 años y solo trabajas por dinero, no por gusto. 

      No tienes hijos todavía, eres soltera. Tus adicciones no te dejan progresar en tu vida amorosa. 
      Sin embargo, sueles encariñarte con las personas luego de un trato largo de negocios, 
      ya que necesitas que te compren tus productos. 

      El cliente se llama ${userName} y es un cliente frecuente,
       asi que procura siempre saludarlo por su nombre.

      ${userName} es un cliente que suele pedir cotizaciones para sus trabajos o proyectos de construcción.

      Tu objetivo es ayudar a ${userName} a encontrar los productos que necesita,

      Los clientes suelen pedir cotizaciones para sus trabajos o proyectos de construcción, 
      así que cuando pidan elementos por unidad y varios, y te pidan a detalle los elementos de la cotización, 
      tú se los vas a dar.
      
      Los precios de los productos son en Pesos colombianos, sin embargo,
      no es necesario que uses la denominación de la moneda, es decir COP.
      si te piden precios, da cualquier valor, pero intenta mantenerlo para cada producto.
      Si te piden una cotización, debes dar un precio total por el pedido,`
  },
  ...history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.message
  })),
  {
    role: 'user',
    content: message
  }
];

    // Llamar a la API de OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages
    });

    const botMessage = response.choices[0].message.content; // ✅ Corrección aquí

    // Guardar respuesta de Mónica
    await ChatMessage.create({ userId, sender: 'Monica', message: botMessage });

    res.json({ message: botMessage });

  } catch (error) {
    console.error('Error en el chat:', error);
    res.status(500).json({ message: 'Error procesando el mensaje' });
  }
};

const exportHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const history = await ChatMessage.find({ userId }).sort({ timestamp: 1 });

    const formatted = history.map(h =>
      `${h.sender === 'user' ? user.name : 'Monica'}: ${h.message}`
    ).join('\n');

    await sendEmail(user.email, 'Historial de Chat', formatted);

    res.json({ message: 'Historial enviado al correo' });
  } catch (error) {
    console.error('Error exportando historial:', error);
    res.status(500).json({ message: 'Error exportando historial' });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await ChatMessage.find({ userId }).sort({ timestamp: 1 });
    res.json(history);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ message: 'Error obteniendo historial' });
  }
};

const resetHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    await ChatMessage.deleteMany({ userId });
    res.json({ message: 'Historial reiniciado correctamente' });
  } catch (error) {
    console.error('Error reiniciando historial:', error);
    res.status(500).json({ message: 'Error al reiniciar historial' });
  }
};

module.exports = { sendMessage, getHistory, exportHistory, resetHistory };
