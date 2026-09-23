const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.get('/api/marcaciones', async (req, res) => {
  try {
    const { empleado, fecha } = req.query;
    let query = 'SELECT * FROM marcaciones';
    let values = [];

    if (empleado) {
      query += ' WHERE codigo_empleado = $1';
      values = [empleado];
    } else if (fecha) {
      query += ' WHERE fecha = $1';
      values = [fecha];
    }

    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/marcaciones/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM marcaciones WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/marcaciones', async (req, res) => {
  const { codigo_empleado, nombre_empleado, fecha, hora_ingreso_programada, hora_ingreso_real, hora_salida_programada, hora_salida_real, observacion } = req.body;


  if (!codigo_empleado || !fecha) {
    return res.status(400).json({ error: 'Código de empleado y fecha son obligatorios' });
  }
  if (hora_salida_real && hora_ingreso_real && hora_salida_real <= hora_ingreso_real) {
    return res.status(400).json({ error: 'La hora de salida no puede ser anterior a la de ingreso' });
  }


  let estado = 'OTRO';
  if (hora_ingreso_real) {
    estado = (hora_ingreso_real <= hora_ingreso_programada) ? 'PUNTUAL' : 'ATRASO';
  }

  try {
    const query = `
      INSERT INTO marcaciones 
      (codigo_empleado, nombre_empleado, fecha, hora_ingreso_programada, hora_ingreso_real, hora_salida_programada, hora_salida_real, estado, observacion) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
    const values = [codigo_empleado, nombre_empleado, fecha, hora_ingreso_programada, hora_ingreso_real, hora_salida_programada, hora_salida_real, estado, observacion];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.delete('/api/marcaciones/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM marcaciones WHERE id = $1', [req.params.id]);
    res.status(200).json({ message: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.API_PORT || 3000, () => console.log('API Iniciada'));