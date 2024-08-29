import { config } from "dotenv";
import { pool } from "../db/db";
import OpenAI from "openai";

config();

// Preguntas guardadas en el backend
const questions = {
  1: "Un proyecto de grupo debe entregarse en una semana y el equipo aún no ha comenzado. ¿Qué haces?",
  2: "Tienes un examen importante mañana y aún no has estudiado. ¿Cómo te preparas?",
  3: "Durante una discusión en clase, alguien presenta un punto de vista completamente opuesto al tuyo. ¿Qué haces?",
  4: "Te piden que organices un evento escolar. ¿Cómo procedes?",
  5: "Un amigo te pide ayuda con un tema que no entiendes bien. ¿Cómo reaccionas?",
  6: "En un trabajo en grupo, ¿cómo prefieres colaborar?",
  7: "¿Cómo reaccionas ante un cambio inesperado en tus planes?",
  8: "Tienes la oportunidad de elegir entre dos asignaturas optativas: una que es muy práctica y otra que es teórica. ¿Cuál eliges?",
  9: "Te sientes abrumado por las responsabilidades escolares y personales. ¿Cómo manejas el estrés?",
  10: "Se te pide que trabajes en un proyecto innovador. ¿Cómo enfocas la tarea?",
};
// Opciones correspondientes
const options = {
  1: {
    a: "Tomo la iniciativa y organizo al equipo para que comencemos cuanto antes.",
    b: "Espero a que alguien más tome la iniciativa, pero estoy dispuesto a colaborar.",
    c: "Empiezo a trabajar por mi cuenta y presento mis avances al grupo.",
    d: "Hablo con el profesor para pedir orientación.",
  },
  2: {
    a: "Hago un plan de estudio detallado y sigo el horario estrictamente.",
    b: "Reviso mis notas y confío en lo que recuerdo de las clases.",
    c: "Estudio con amigos para intercambiar conocimientos y dudas.",
    d: "Busco resúmenes y material adicional en internet para una comprensión rápida.",
  },
  3: {
    a: "Defiendo mi punto de vista con argumentos sólidos.",
    b: "Escucho atentamente y trato de entender su perspectiva.",
    c: "Evito la confrontación y cambio de tema.",
    d: "Investigo más sobre el tema para tener una mejor base en futuras discusiones.",
  },
  4: {
    a: "Diseño un plan detallado y delego tareas específicas a cada miembro del equipo.",
    b: "Recojo ideas de todos y busco consenso antes de tomar decisiones.",
    c: "Me aseguro de que el evento sea divertido y participativo para todos.",
    d: "Me enfoco en los aspectos técnicos y logísticos para asegurar el éxito del evento.",
  },
  5: {
    a: "Le digo que no puedo ayudar, pero le sugiero a alguien que sí puede.",
    b: "Intento ayudarlo lo mejor que puedo y busco recursos juntos.",
    c: "Le sugiero que busquemos la información y aprendamos juntos.",
    d: "Me disculpo y explico que no tengo el conocimiento necesario para ayudar.",
  },
  6: {
    a: "Prefiero liderar y asegurarme de que todo el mundo esté haciendo su parte.",
    b: "Me adapto a lo que el grupo necesite, ya sea liderar o seguir.",
    c: "Me enfoco en mi parte del trabajo y confío en que los demás harán lo suyo.",
    d: "Busco contribuir con ideas y apoyar en lo que sea necesario.",
  },
  7: {
    a: "Me siento frustrado pero rápidamente hago un nuevo plan.",
    b: "Me adapto al cambio y busco soluciones creativas.",
    c: "Me estreso pero trato de seguir adelante.",
    d: "Busco apoyo en otros para manejar la situación.",
  },
  8: {
    a: "Elijo la práctica porque disfruto aplicar lo que aprendo.",
    b: "Elijo la teórica porque me gusta profundizar en los conceptos.",
    c: "Elijo la que creo que será más fácil.",
    d: "Elijo la que me permita trabajar en equipo.",
  },
  9: {
    a: "Hago una lista de tareas y las abordo una por una.",
    b: "Hablo con amigos o familiares para desahogarme.",
    c: "Tomo un descanso y me enfoco en actividades que me relajan.",
    d: "Busco técnicas de manejo de estrés como la meditación o el ejercicio.",
  },
  10: {
    a: "Investigo las tendencias actuales y desarrollo un plan innovador.",
    b: "Colaboro con otros para generar ideas creativas.",
    c: "Uso métodos tradicionales pero les doy un giro innovador.",
    d: "Me enfoco en asegurar que todas las ideas sean prácticas y realizables.",
  },
};

export const chatCompletionHandler = async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
    //Recibir datos desde el frontend
    const { student_id, answers, date_answers } = req.body;

    // Crear el mensaje para enviar a la API
    let messageContent = `Un estudiante ha respondido a las siguientes preguntas:\n\n`;
    for (let [key, answer] of Object.entries(answers)) {
      messageContent += `${questions[key]}\nRespuesta: ${options[key][answer]}\n\n`;
    }
    messageContent += `Según las respuestas, dame un listado con 5 habilidades y debilidades correspondientes del alumno, además por último coloca su tipo de personalidad MBTI. La respuesta debe ser así, ejemplo: Tipo de personalidad MBTI: XXXX 5 habilidades: X, X, X, X y X 5 debilidades: X, X, X, X y X. No incluyas explicaciones que no están en el ejemplo.`;

    const chat = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente en psicología. Analiza las respuestas y sigue las instrucciones proporcionadas por el usuario, el texto que me retornes debe estar en texto plano no markdown",
        },
        { role: "user", content: messageContent },
      ],
      model: "gpt-4o-mini",
    });
    const responseContent = chat.choices[0].message.content;

    // Guardar resultados de GPT en la BD
    // 1ero Intentar actualizar
    const updateResult = await pool.query(
      "UPDATE answers_surveys SET answers = $2, date_answers = $3 WHERE student_id = $1",
      [student_id, responseContent, date_answers]
    );
    //2do Si no se actualizó ninguna fila, insertar una nueva
    if (updateResult.rowCount === 0) {
      await pool.query(
        "INSERT INTO answers_surveys (student_id, answers, date_answers) VALUES ($1, $2, $3)",
        [student_id, responseContent, date_answers]
      );
      res.json({ mensaje: "Encuesta registrada" });
    } else {
      res.json({ mensaje: "Encuesta actualizada" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Ocurrió un error al procesar la solicitud." });
  }
};

export const createGroup = async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
    //Recibir datos desde el frontend
    const { course_id, members, name_subject } = req.body;

    //Consulta para obtener los estudiantes y sus resultados de personalidad
    const studentsResult = await pool.query(
      "select u.user_id, u.names || ' ' || u.last_names AS full_name , as2.answers  from users u inner join courses c on u.course_id=c.course_id inner join answers_surveys as2 on u.user_id=as2.student_id where u.user_type='estudiante' and u.course_id = $1",
      [course_id]
    );
    const students = studentsResult.rows;

    // Mapeo para obtener un objeto con ID como clave y nombre completo como valor
    const studentMap = students.reduce((map, student) => {
      map[student.user_id] = student.full_name;
      return map;
    }, {});

    // Preparar la lista de estudiantes con sus respuestas para enviar a GPT
    const studentDetails = students.map((student) => ({
      id: student.user_id,
      answers: student.answers,
    }));

    const gptMessage = `
      Quiero conformar grupos de ${members} estudiantes pero si llega a existir ungrupo con un sólo integrante elimina ese grupo y anexa ese integrante al grupo anterior sin importar que exceda el números de miembros especificado inicalmente. NINGÚN ESTUDIANTE PUEDE QUEDAR SÓLO, ESTO ESTÁ PROHIBIDO: "grupo 4": "9" (significa que un estudiante es un sólo grupo y eso es ilógico)
      dame los grupos de trabajo según la mejor combinación de sus personalidades, quiero que la respuesta venga así por ejemplo: {"grupo 1": "1,4",(deben ir los id de estudiantes que conformaran el grupo)"grupo 2":"5,7"}, sus personalidades son las siguientes: ${JSON.stringify(
        studentDetails
      )}
    `;

    const chat = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente en psicología, el texto que me retornes debe estar en texto plano no markdown",
        },
        { role: "user", content: gptMessage },
      ],
      model: "gpt-4o-mini",
    });

    const responseContent = chat.choices[0].message.content;
    console.log(responseContent);
    // Convertir la respuesta de GPT en un objeto JSON
    let grupos = JSON.parse(responseContent);

    // Verificar y ajustar los grupos antes de enviarlos al cliente
    grupos = adjustGroups(grupos);

    const gruposConNombres = Object.keys(grupos).reduce(
      (acc: Record<string, string>, groupName: string) => {
        const ids = grupos[groupName].split(",").map((id) => id.trim());
        const nombres = ids.map((id) => studentMap[parseInt(id, 10)]).join(",");
        acc[groupName] = nombres;
        return acc;
      },
      {}
    );

    res.json({ mensaje: "Grupos creados", gruposConNombres });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Ocurrió un error al procesar la solicitud." });
  }
};

const adjustGroups = (
  grupos: Record<string, string>
): Record<string, string> => {
  const groupEntries = Object.entries(grupos);
  const modifiedGroups: Record<string, string> = {};
  let singleStudent: string | null = null;

  // Recorremos los grupos para identificar y gestionar grupos con un solo estudiante
  groupEntries.forEach(([groupName, group]) => {
    // Aseguramos que group sea una cadena de texto
    if (typeof group === "string") {
      const studentIds = group.split(",").map((id) => id.trim());
      if (studentIds.length === 1) {
        singleStudent = studentIds[0];
      } else {
        modifiedGroups[groupName] = group;
      }
    }
  });

  // Si hay un estudiante solitario, lo redistribuimos
  if (singleStudent) {
    // Encontrar un grupo al que agregar al estudiante solitario
    const nonEmptyGroups = Object.keys(modifiedGroups);
    if (nonEmptyGroups.length > 0) {
      // Agregar el estudiante solitario al primer grupo no vacío
      const firstGroupName = nonEmptyGroups[0];
      modifiedGroups[
        firstGroupName
      ] = `${modifiedGroups[firstGroupName]},${singleStudent}`;
    }
  }

  return modifiedGroups;
};
