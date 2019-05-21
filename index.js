const functions = require("firebase-functions");
const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");

const app = express();
const api_key = "195003";
admin.initializeApp();

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    console.log("TCL: act", agent);

    const action = request.body.queryResult.action;
    const parameters = request.body.queryResult.parameters;
    var chat = "Sorry, i didn't get you";
    response.setHeader("Content-Type", "application/json");

    switch (action) {
      case "GetArtistInfo":
        getArtistInfo(parameters.albumartist, response);
        break;
      case "GetAlbumInfo":
        getArtistAlbumInfo(
          parameters.albumartist,
          parameters.musicalbum,
          response
        );
        break;
      case "GetMusicByGenre":
        break;
      case "GetTopChart":
        break;
      case "input.unknown":
        break;

      default:
        buildChatResponse(chat);
        break;
    }
  }
);

function buildChatResponse(chat) {
  return JSON.stringify({ fulfillmentText: chat });
}

function getArtistInfo(artistName, cfres) {
  axios
    .get(
      `http://theaudiodb.com/api/v1/json/195003/search.php?s=${artistName}`,
      { headers: { key: api_key } }
    )
    .then(response => {
      if (response.status === 200) {
        var chat = response.data.artists[0].strBiographyEN;
        var website = response.data.artists[0].strWebsite;
        console.log("TCL: getArtistInfo -> chat", chat);
        cfres.send(buildChatResponse(chat));
      }
      return true;
    })
    .catch(err => {
      var chat = `Sorry but i've never heard about ${artistName} 😅`;
      cfres.send(buildChatResponse(chat));
      console.log("TCL: getArtistInfo -> err", { err });
    });
}

function getArtistAlbumInfo(artistName, albumName, cfres) {
  axios
    .get(
      `http://theaudiodb.com/api/v1/json/195003/searchalbum.php?s=${artistName}&a=${albumName}`,
      {
        headers: {
          key: api_key
        }
      }
    )
    .then(response => {
      if (response.status === 200) {
        var description = response.data.album[0].strDescriptionEN;
        cfres.send(buildChatResponse(description));
      }
      return true;
    })
    .catch(err => {
      var chat = `I'm not sure ${artistName} has recorded an album called ${albumName} 🤔`;
      cfres.send(buildChatResponse(chat));
      console.log("TCL: getAlbumInfo -> err", { err });
    });
}
