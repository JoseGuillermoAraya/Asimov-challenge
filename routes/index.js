const uniqid = require('uniqid');
const express = require('express');
const dfns = require('date-fns');

const router = express.Router();

const record = [
  {
    id: '96rheucerokzcyz8rz',
    user: 'JG',
    email: 'test@test.com',
    'start-date': new Date('2022-2-9 12:45Z'),
  },
  {
    id: '96rheucerokzcyz8rz',
    user: 'JG',
    email: 'test@test.com',
    'start-date': new Date('2022-2-9 13:45Z'),
  },
  {
    id: '96rheucerokzcyz8rz',
    user: 'JG',
    email: 'test@test.com',
    'start-date': new Date('2022-2-9 16:45Z'),
  },
  {
    id: '96rheucerokzcyz8rz',
    user: 'JG',
    email: 'test@test.com',
    'start-date': new Date('2022-6-23 12:45Z'),
  },
  {
    id: 'delete-test',
    user: 'JG',
    email: 'test@test.com',
    'start-date': new Date('2021-6-23 12:45Z'),
  },
];
const SUCCESS = { status: 'success' };
const FAILURE = { status: 'failure' };
const NONUPDATABLE = ['user'];
const KEYS = ['id', 'user', 'email', 'start-date'];
const inputKeys = KEYS.slice(1);

const findAppointmentIdx = (id) => {
  let status = SUCCESS;
  let message;
  const idx = record.findIndex((a) => a.id === id);
  if (idx === -1) {
    status = FAILURE;
    message = `could not find appointment with id: ${id}`;
  }
  return [status, message, idx];
};
const validKeys = (body, keys) => {
  let message;
  let status = SUCCESS;
  const valid = Object.keys(body).every((k) => {
    if (!keys.includes(k)) {
      message = `the property ${k} is not in the model`;
      status = FAILURE;
      return false;
    }
    return true;
  });
  return [status, message, valid];
};
const isFree = (date, selfId) => {
  let modRecord = record;
  if (selfId) {
    modRecord = record.filter((e) => e.id !== selfId);
  }
  const colliding = modRecord.find(
    (e) => date > dfns.sub(e['start-date'], { hours: 1 })
      && date < dfns.add(e['start-date'], { hours: 1 }),
  );
  return !colliding;
};
const isOfficeHours = (date) => {
  const day = dfns.getDay(date);
  const hour = date.getUTCHours();
  const minutes = dfns.getMinutes(date);
  console.log('day', day, 'hour', hour, 'min', minutes);
  // for the appointment to be in office hours it must be at most at 17
  if (day === 6 || day === 0 || hour > 17 || hour < 9 || (hour === 17 && minutes !== 0)) {
    return false;
  }
  return true;
};
/* GET home page. */
router.get('/', (req, res) => {
  res.json({ json: true });
});

router.post('/addApointment', (req, res) => {
  let message;
  let status = SUCCESS;
  let areValidKeys;
  let newAppoint;
  console.log('req: ', req.body);
  const newDate = new Date(req.body['start-date']);
  // check if input has only and every model key
  [status, message, areValidKeys] = validKeys(req.body, inputKeys);
  // check if input keys and model keys are the same // check valid date format
  if (inputKeys.length !== Object.keys(req.body).length) {
    message = `input doesn't have the same number of keys as the input model. input KEYS: ${inputKeys}`;
    status = FAILURE;
  } else if (req.body['start-date'] && Number.isNaN(Number(newDate))) {
    message = 'invalid date format';
    status = FAILURE;
  } else if (!isOfficeHours(newDate)) {
    message = 'date is outside office hours';
    status = FAILURE;
  } else if (!isFree(newDate)) {
    message = 'colliding date';
    status = FAILURE;
  } else if (areValidKeys) {
    newAppoint = {
      id: uniqid(),
      user: req.body.user,
      email: req.body.email,
      'start-date': new Date(req.body['start-date']),
    };
    record.push(newAppoint);
  }
  res.json({ ...status, message, appointment: newAppoint });
});
router.get('/getAppointment', (req, res) => {
  console.log('req: ', req.body);
  const [status, message, idx] = findAppointmentIdx(req.body.id);
  const appt = record[idx];
  res.json({ ...status, message, appointment: appt });
});
router.post('/updateAppointment', (req, res) => {
  let input = req.body;
  let resultAppt;
  console.log('req: ', input);
  let [status, message, idx] = findAppointmentIdx(input.id);
  if (idx !== -1) {
    const oldAppt = record[idx];
    // check for keys not in model
    let areValidKeys;
    [status, message, areValidKeys] = validKeys(req.body, KEYS);
    // check for keys not in model, check if updating unupdatable keys
    const validUpdate = Object.keys(input).every((k) => {
      if (NONUPDATABLE.includes(k) && oldAppt[k] !== input[k]) {
        message = `you can't update ${k}`;
        status = FAILURE;
        return false;
      }
      return true;
    });
    // check date format if updating date
    let validDate = true;
    if (Object.keys(input).includes('start-date')) {
      const newDate = new Date(input['start-date']);
      if (Number.isNaN(Number(newDate))) {
        message = 'invalid date format';
        status = FAILURE;
        validDate = false;
      } else {
        // check if is office hours
        if (!isOfficeHours(newDate)) {
          message = 'date is outside office hours';
          status = FAILURE;
          validDate = false;
        }
        // check if date collides
        else if (!isFree(newDate, req.body.id)) {
          message = 'colliding date';
          status = FAILURE;
          validDate = false;
        }
        // make input date Date object
        input['start-date'] = newDate;
      }
    }
    if (validUpdate && areValidKeys && validDate) {
      const newAppt = { ...oldAppt, ...input };
      record[idx] = newAppt;
      resultAppt = newAppt;
    }
  } else {
    input = undefined;
  }
  res.json({ ...status, message, appointment: resultAppt });
});
router.post('/deleteAppointment', (req, res) => {
  console.log('req: ', req.body);
  const [status, message, idx] = findAppointmentIdx(req.body.id);
  record.splice(idx, 1);
  res.json({ ...status, message });
});
router.get('/getHoursTaken', (req, res) => {
  console.log('req: ', req.body);
  const taken = record.map((e) => e['start-date']);
  res.json(taken);
});
module.exports = router;
