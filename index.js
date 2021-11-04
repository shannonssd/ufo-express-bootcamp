import express from 'express';
import methodOverride from 'method-override';
import { read, write, add } from './jsonFileStorage.js';

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

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

// 3. GET Request for all sightings (Home)
app.get('/', (req, res) => {
  read('data.json', (err, data) => {
    if (err) {
      res.status(500).send('Sorry! Error reading database!');
    }
    res.render('home', data);
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

      if (alienShape in shapesObject) {
        console.log('Repeat');
      } else {
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
