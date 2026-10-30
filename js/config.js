/*
 * CONFIGURACIÓN DE IMÁGENES — Valesca Calle
 * Canales: 7 sintonizaciones; el octavo golpe rompe el televisor.
 * Billy.png y Mandy.png deben estar en assets/images/personajes/.
 * Si tus nombres difieren, modifica únicamente las rutas de las dos capas.
 */
window.INVITE_CONFIG = {
  birthdayName: "Valesca Calle",
  channels: [
    { image: "assets/images/canales/Ben-10.jpg", label: "CH. 01 · BEN 10" },
    {
      image: "assets/images/canales/Chicas-SuperPoderosas.jpg",
      label: "CH. 02 · LAS CHICAS SUPERPODEROSAS",
    },
    {
      image: "assets/images/canales/Ed-Edd-Eddie.jpg",
      label: "CH. 03 · ED, EDD Y EDDIE",
    },
    {
      images: [
        "assets/images/personajes/Billy.png",
        "assets/images/personajes/Mandy.png",
      ],
      labels: ["BILLY", "MANDY"],
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
    /* Ben: se acerca un poco más desde la esquina inferior izquierda. */
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
    /* Las chicas: más profundidad para que se vean las tres caras completas. */
    {
      image: "assets/images/personajes/Chicas-Superpoderosas.png",
      edge: "top",
      position: 19,
      size: 222,
      peek: 151,
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
    /* Ed, Edd y Eddie: se aumenta el tamaño y el área visible para incluir a Ed. */
    {
      image: "assets/images/personajes/Ed-Edd-Eddie.png",
      edge: "top",
      position: 79,
      size: 224,
      peek: 147,
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
    /* Jack sube hacia la esquina superior derecha y deja libre el final del título. */
    {
      image: "assets/images/personajes/Samurai-Jack.png",
      edge: "right",
      position: 17,
      size: 146,
      peek: 82,
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
    /* Billy y Mandy también rellenan el hueco que dejó Pikachu en el marco. */
    {
      image: "assets/images/personajes/Billy.png",
      edge: "top",
      position: 46,
      size: 160,
      peek: 104,
      float: 7,
      floatX: 2,
      duration: 3.6,
    },
    {
      image: "assets/images/personajes/Mandy.png",
      edge: "top",
      position: 61,
      size: 154,
      peek: 101,
      float: 6,
      floatX: 2,
      duration: 4.4,
    },
  ],
};
