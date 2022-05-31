const labeling = label => {
  switch (label) {
    case "first_name":
      return "Nombre";
    case "last_name":
      return "Apellido";
    case "birth_date":
      return "Fecha de nacimiento";
    case "gender":
      return "Género";
    case "id_type":
      return "Tipo de documento";
    case "id_number":
      return "Número de documento";
    case "id_expedition_date":
      return "Fecha de expedición";
    case "id_expedition_place":
      return "Lugar de expedición";
    case "civil_status":
      return "Estado civil";
    case "email":
      return "Email";
    case "phone_number":
      return "Número de telefono";
    case "height":
      return "Altura";
    case "weight":
      return "Peso";
    case "rh":
      return "Rh";
    case "habits":
      return "Habitos";
    case "environment":
      return "Ambiente";
    case "financial":
      return "Fianciero";
    case "psychosocial":
      return "Psicosocial";
    case "familyhistory":
      return "Historia Familiar";
    case "personalhistory":
      return "Historia Personal";
    case "vitalsigns":
      return "Signos Vitales";
    case "clinical_observation":
      return "Observación Clinica";
    case "heent":
      return "Mente";
    case "neck":
      return "Cuello";
    case "nodes":
      return "Nodo";
    case "spine":
      return "Columna";
    case "abdomen":
      return "Abdomen";
    case "extremities":
      return "Extremidades";
    case "neurological":
      return "Neurológico";
    case "pelvic":
      return "Pelvico";
    case "rectal":
      return "Rectal";
    case "wbc":
      return "WBC";
    case "abg":
      return "ABG";
    case "ekg":
      return "EHG";
    case "cxr":
      return "CXR";
    case "constitutional":
      return "Costitucional";
    case "nurse_observation":
      return "Observación de enfermería";
    case "respiratory":
      return "Respiratorio";
    case "cardiac":
      return "Cardiaco";
    case "vascular":
      return "Vascular";
    case "gi":
      return "GI";
    case "gu":
      return "GU";
    case "neuromuscular":
      return "Neuromuscular";
    case "emotional":
      return "Emocional";
    case "hematological":
      return "Hematológico";
    case "rheumatic":
      return "Reumatología";
    case "endocrine":
      return "Endocrinología";
    case "dermatological":
      return "Dermatología";
    case "radiologyurl":
      return "Radiología";
    case "username":
      return "Usuario";
    case "role_name":
      return "Rol";
    case "med_name":
      return "Nombre del médico";
    case "pat_name":
      return "Nombre del paciente";
    case "reason":
      return "Motivo";
    case "date_part":
      return "Edad";
  }
}

const format = result => {
  const info = result.map(row =>{
    const keys = Object.keys(row);
    const rsl = keys.map(key => {
        return {id:key, content:row[key], label:labeling(key)};
    });
    return rsl;
  });
  return info
}

module.exports = format;
