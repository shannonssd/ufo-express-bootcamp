import express from 'express';
import methodOverride from 'method-override';
import { read, write, add } from './jsonFileStorage.js';

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

// 1a. GET Request for new sighting
app.get('/sighting', (req, res) => {
  res.render('new-sighting');
});

// 1b. POST Request for new sightning
app.post('/sighting/new', (req, res) => {
  add('data.json', 'sightings', req.body, (err) => {
    if (err) {
      res.status(500).send('Sorry! Error adding sighting!');
    }
    read('data.json', (error, data) => {
      if (error) {
        res.status(500).send('Sorry! Error reading database!');
      }
      /* Use length of array to determine index of latest entry
      to be used in URL path for redirecting */
      const arrayLength = data.sightings.length;
      const lastElementIndex = arrayLength - 1;
      res.redirect(`/sighting/${lastElementIndex}`);
    });
  });
});

// 2. GET Request for individual sighting
app.get('/sighting/:index', (req, res) => {
  read('data.json', (err, data) => {
    if (err) {
      res.status(500).send('Sorry! Error reading database!');
    }
    const { index } = req.params;
    const sighting = data.sightings[index];
    sighting.index = index;
    res.render('sighting', sighting);
  });
});

// Callback function to store all unique city names in an array
const createCityArray = (data) => {
  const cityObj = {};
  const sightingsArr = data.sightings;
  for (let i = 0; i < sightingsArr.length; i += 1) {
    if (!(sightingsArr[i].city in cityObj)) {
      cityObj[sightingsArr[i].city] = sightingsArr[i].city;
    }
  }
  const cityArray = Object.values(cityObj);
  return cityArray;
};

// Callback function to store all unique state names in an array
const createStateArray = (data) => {
  const stateObj = {};
  const sightingsArr = data.sightings;
  for (let i = 0; i < sightingsArr.length; i += 1) {
    if (!(sightingsArr[i].state in stateObj)) {
      stateObj[sightingsArr[i].state] = sightingsArr[i].state;
    }
  }
  const stateArray = Object.values(stateObj);
  return stateArray;
};

// Callback function to store all unique durations in an array
const createDurationArray = (data) => {
  const durationObj = {};
  const sightingsArr = data.sightings;
  for (let i = 0; i < sightingsArr.length; i += 1) {
    if (!(sightingsArr[i].duration in durationObj)) {
      durationObj[sightingsArr[i].duration] = sightingsArr[i].duration;
    }
  }
  const durationArray = Object.values(durationObj);
  return durationArray;
};

// Callback function to store all unique shapes in an array
const createShapeArray = (data) => {
  const shapeObj = {};
  const sightingsArr = data.sightings;
  for (let i = 0; i < sightingsArr.length; i += 1) {
    if (!(sightingsArr[i].shape in shapeObj)) {
      shapeObj[sightingsArr[i].shape] = sightingsArr[i].shape;
    }
  }
  const shapeArray = Object.values(shapeObj);
  return shapeArray;
};

// Callback function to store all unique dates in an array
const createDateArray = (data) => {
  const dateObj = {};
  const sightingsArr = data.sightings;
  for (let i = 0; i < sightingsArr.length; i += 1) {
    if (!(sightingsArr[i].date_time in dateObj)) {
      dateObj[sightingsArr[i].date_time] = sightingsArr[i].date_time;
    }
  }
  const dateArray = Object.values(dateObj);
  return dateArray;
};

// 3. GET Request for all sightings (Home)
app.get('/', (req, res) => {
  read('data.json', (err, data) => {
    if (err) {
      res.status(500).send('Sorry! Error reading database!');
    }
    // Store array of unique city names in data object
    const cityArr = createCityArray(data);
    data.cityArr = cityArr;

    // Store array of unique durations names in data object
    const durationArr = createDurationArray(data);
    data.durationArr = durationArr;

    // Store array of unique state names in data object
    const stateArr = createStateArray(data);
    data.stateArr = stateArr;

    // Store array of unique state names in data object
    const shapeArr = createShapeArray(data);
    data.shapeArr = shapeArr;

    // Store array of unique state names in data object
    const dateArr = createDateArray(data);
    data.dateArr = dateArr;

    if (Object.keys(req.query)[0] === 'duration') {
      // Store obj info + array index of filtered cities
      const filteredDuration = req.query.duration;
      const sightings = [];
      const sightingIndex = [];
      for (let j = 0; j < data.sightings.length; j += 1) {
        if (data.sightings[j].duration === filteredDuration) {
          sightings.push(data.sightings[j]);
          sightingIndex.push([j]);
        }
      }
      const newObj = { sightings };
      // Add array of each category for drop down bars
      newObj.dateArr = dateArr;
      newObj.shapeArr = shapeArr;
      newObj.durationArr = durationArr;
      newObj.cityArr = cityArr;
      newObj.array = sightingIndex;
      newObj.stateArr = stateArr;
      res.render('home', newObj);
    } else if (Object.keys(req.query)[0] === 'city') {
      // Store obj info + array index of filtered cities
      const filteredCity = req.query.city;
      const sightings = [];
      const sightingIndex = [];
      for (let j = 0; j < data.sightings.length; j += 1) {
        if (data.sightings[j].city === filteredCity) {
          sightings.push(data.sightings[j]);
          sightingIndex.push([j]);
        }
      }
      const newObj = { sightings };
      // Add array of each category for drop down bars
      newObj.dateArr = dateArr;
      newObj.shapeArr = shapeArr;
      newObj.cityArr = cityArr;
      newObj.durationArr = durationArr;
      newObj.stateArr = stateArr;
      newObj.array = sightingIndex;
      res.render('home', newObj);
    } else if (Object.keys(req.query)[0] === 'state') {
      // Store obj info + array index of filtered cities
      const filteredState = req.query.state;
      const sightings = [];
      const sightingIndex = [];
      for (let j = 0; j < data.sightings.length; j += 1) {
        if (data.sightings[j].state === filteredState) {
          sightings.push(data.sightings[j]);
          sightingIndex.push([j]);
        }
      }
      const newObj = { sightings };
      // Add array of each category for drop down bars
      newObj.dateArr = dateArr;
      newObj.shapeArr = shapeArr;
      newObj.stateArr = stateArr;
      newObj.cityArr = cityArr;
      newObj.durationArr = durationArr;
      newObj.array = sightingIndex;
      res.render('home', newObj);
    } else if (Object.keys(req.query)[0] === 'shape') {
      // Store obj info + array index of filtered cities
      const filteredShape = req.query.shape;
      const sightings = [];
      const sightingIndex = [];
      for (let j = 0; j < data.sightings.length; j += 1) {
        if (data.sightings[j].shape === filteredShape) {
          sightings.push(data.sightings[j]);
          sightingIndex.push([j]);
        }
      }
      const newObj = { sightings };
      // Add array of each category for drop down bars
      newObj.dateArr = dateArr;
      newObj.shapeArr = shapeArr;
      newObj.stateArr = stateArr;
      newObj.cityArr = cityArr;
      newObj.durationArr = durationArr;
      newObj.array = sightingIndex;
      res.render('home', newObj);
    } else if (Object.keys(req.query)[0] === 'date_time') {
      // Store obj info + array index of filtered cities
      const filteredDate = req.query.date_time;
      const sightings = [];
      const sightingIndex = [];
      for (let j = 0; j < data.sightings.length; j += 1) {
        if (data.sightings[j].date_time === filteredDate) {
          sightings.push(data.sightings[j]);
          sightingIndex.push([j]);
        }
      }
      const newObj = { sightings };
      // Add array of each category for drop down bars
      newObj.dateArr = dateArr;
      newObj.shapeArr = shapeArr;
      newObj.stateArr = stateArr;
      newObj.cityArr = cityArr;
      newObj.durationArr = durationArr;
      newObj.array = sightingIndex;
      res.render('home', newObj);
    } else {
      const sightingIndex = [];
      for (let j = 0; j < data.sightings.length; j += 1) {
        sightingIndex.push([j]);
      }
      data.array = sightingIndex;
      res.render('home', data);
    }
  });
});

// 4a. GET Request for editting sighting
app.get('/sighting/:index/edit', (req, res) => {
  const { index } = req.params;
  read('data.json', (err, data) => {
    if (err) {
      res.status(500).send('Sorry! Error reading database!');
    }
    const sighting = data.sightings[index];
    sighting.index = index;
    res.render('edit', { sighting });
  });
});

// 4b. PUT Request for editting sighting
app.put('/sighting/:index', (req, res) => {
  read('data.json', (err, data) => {
    const { index } = req.params;
    data.sightings[index] = req.body;
    write('data.json', data, (error) => {
      if (error) {
        res.status(500).send('Sorry! Error writing in databse!');
      }
      res.redirect(`${index}`);
    });
  });
});

// 5. DELETE Request to delete sighting
app.delete('/sighting/:index/delete', (req, res) => {
  const { index } = req.params;
  read('data.json', (err, data) => {
    data.sightings.splice(index, 1);
    write('data.json', data, (err) => {
      res.redirect('/');
    });
  });
});

// 6. GET Request for list of sighting shapes
app.get('/shapes', (req, res) => {
  read('data.json', (err, data) => {
    const shapesObject = {};
    const sightingsArray = data.sightings;
    for (let i = 0; i < sightingsArray.length; i += 1) {
      const alienShape = sightingsArray[i].shape;

      if (!(alienShape in shapesObject)) {
        shapesObject[alienShape] = alienShape;
      }
    }
    const shapesList = Object.values(shapesObject);
    res.render('shapes', { shapesList });
  });
});

// 7. GET Request
app.get('/shapes/:shape', (req, res) => {
  read('data.json', (err, data) => {
    const { shape } = req.params;
    const matchingIndexArray = [];
    const sightingsArray = data.sightings;
    for (let i = 0; i < sightingsArray.length; i += 1) {
      if (sightingsArray[i].shape === shape) {
        matchingIndexArray.push(i);
      }
    }
    const shapesObj = {};
    shapesObj.array = matchingIndexArray;
    shapesObj.shape = shape;
    res.render('shape-list', shapesObj);
  });
});
app.listen(3004);
