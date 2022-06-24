import * as Yup from 'yup';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    /*
    
      params: body|query.text:string,
              separators:([{token:any,startIndex:number},],
              body|query.useServerFormat:Boolean)
      return: JSON  
              
    */

    if (!(await checkInput(req))) {
      return res.status(400).json({ err: 'parameters not set properly' });
    }

    textResponse(res, splitString(req));
  }
}

async function checkInput(req) {
  const separatorsSchema = Yup.object().shape({
    token: Yup.string().required(),
    startIndex: Yup.number().required(),
  });

  const schema = Yup.object().shape({
    text: Yup.string().required(),
    separators: Yup.array().of(separatorsSchema),
    useFormat: Yup.boolean(),
  });

  return await schema.isValid(req.body || req.query);
}

function textResponse(res, jsonResponse) {
  return res.status(200).json(jsonResponse);
}

function splitString(req) {
  let { text, separators, useServerFormat } = req.body || req.query;

  if ((!useServerFormat && !separators) || useServerFormat) {
    separators = [
      { token: '/ - (.*)/s', startIndex: 0 },
      { token: 'valor', startIndex: 1 },
      { token: ' ', startIndex: 1 },
    ];
  }

  text = [text];

  for (let sep in separators) {
    text = [
      ...text[separators[sep].startIndex].trim().split(separators[sep].token),
      ...text,
    ];
  }

  // TODO format result
  return Object.fromEntries(
    new Map([
      text.slice(0, 2),
      text.slice(2, 4),
      text.slice(4, 6),
      ['local', text[6].trim()],
    ])
  );
}
