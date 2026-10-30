/*
 * CONFIGURACIÓN DE IMÁGENES — Valesca Calle
 *
 * Canales: siete imágenes dentro de assets/images/canales/.
 * El octavo golpe rompe el televisor.
 *
 * Personajes: PNG individuales dentro de assets/images/personajes/.
 * Las posiciones usan el borde indicado y un porcentaje a lo largo de ese borde.
 */
window.INVITE_CONFIG = {
  birthdayName: "Valesca Calle",

  channels: [
    {
      image: "assets/images/canales/Ben-10.jpg",
      label: "CH. 01 · BEN 10",
    },
    {
      image: "assets/images/canales/Chicas-SuperPoderosas.jpg",
      label: "CH. 02 · LAS CHICAS SUPERPODEROSAS",
    },
    {
      image: "assets/images/canales/Ed-Edd-Eddie.jpg",
      label: "CH. 03 · ED, EDD Y EDDIE",
    },
    {
      // OJO: el canal usa el JPG de /canales, no los PNG del marco final.
      image: "assets/images/canales/Billy y Mandy.jpg",
      label: "CH. 04 · LAS SOMBRÍAS AVENTURAS DE BILLY Y MANDY",
    },
    {
      image: "assets/images/canales/Hora-de-Aventura.jpg",
      label: "CH. 05 · HORA DE AVENTURA",
    },
    {
      image: "assets/images/canales/KND-N1.jpg",
      label: "CH. 06 · LOS CHICOS DEL BARRIO",
    },
    {
      image: "assets/images/canales/Samurai-Jack.jpg",
      label: "CH. 07 · SAMURAI JACK",
    },
  ],

  characters: [
    {
      image: "assets/images/personajes/Ben-10.png",
      edge: "bottom",
      position: 14,
      size: 186,
      peek: 108,
      float: 8,
      floatX: 2,
      duration: 3.7,
    },
    /* Arriba solo quedan las Chicas Superpoderosas y Ed, Edd y Eddy. */
    {
      image: "assets/images/personajes/Chicas-Superpoderosas.png",
      edge: "top",
      position: 24,
      size: 242,
      peek: 184,
      float: 7,
      floatX: 3,
      duration: 4.6,
    },
    {
      image: "assets/images/personajes/Coraje.png",
      edge: "bottom",
      position: 86,
      size: 160,
      peek: 90,
      float: 7,
      floatX: 2,
      duration: 3.5,
    },
    {
      image: "assets/images/personajes/Ed-Edd-Eddie.png",
      edge: "top",
      position: 76,
      size: 236,
      peek: 184,
      float: 8,
      floatX: 3,
      duration: 4.9,
    },
    {
      image: "assets/images/personajes/Finn.png",
      edge: "bottom",
      position: 51,
      size: 151,
      peek: 82,
      float: 6,
      floatX: 2,
      duration: 4.2,
    },
    {
      image: "assets/images/personajes/KND-N1.png",
      edge: "left",
      position: 42,
      size: 174,
      peek: 94,
      float: 7,
      floatX: 2,
      duration: 3.8,
    },
    /* Samurai Jack vuelve al lateral derecho, algo más abajo que antes. */
    {
      image: "assets/images/personajes/Samurai-Jack.png",
      edge: "right",
      position: 42,
      size: 146,
      peek: 86,
      float: 6,
      floatX: 2,
      duration: 4.6,
    },
    {
      image: "assets/images/personajes/Scooby-Doo.png",
      edge: "right",
      position: 76,
      size: 170,
      peek: 98,
      float: 8,
      floatX: 3,
      duration: 4.0,
    },
    /* Billy y Mandy ocupan el lateral izquierdo, frente a Scooby-Doo. */
    {
      image: "assets/images/personajes/Billy.png",
      edge: "left",
      position: 67,
      size: 164,
      peek: 106,
      float: 7,
      floatX: 2,
      duration: 3.6,
    },
    {
      image: "assets/images/personajes/Mandy.png",
      edge: "left",
      position: 83,
      size: 160,
      peek: 103,
      float: 6,
      floatX: 2,
      duration: 4.4,
    },
  ],
};
