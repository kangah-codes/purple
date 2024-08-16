import { Polygon } from 'react-native-svg';

/**
 * Renders a zigzag view with the specified number of teeth.
 *
 * @param numberOfTeeth - The number of teeth in the zigzag view. Defaults to 60.
 * @returns An array of React elements representing the zigzag view.
 */
function renderZigZagView(numberOfTeeth: number = 60) {
    let nodes = [];

    for (let i = 0; i < numberOfTeeth; i++) {
        const point = `${10 * i},0 ${10 * i + 5},10 ${10 * (i + 1)},0`; // Adjust the spacing between teeth
        nodes.push(<Polygon key={i} points={point} strokeWidth='2' />);
    }
    return nodes;
}

export const ZIGZAG_VIEW = [
    <Polygon points='0,0 5,10 10,0' strokeWidth='2' />,
    <Polygon points='10,0 15,10 20,0' strokeWidth='2' />,
    <Polygon points='20,0 25,10 30,0' strokeWidth='2' />,
    <Polygon points='30,0 35,10 40,0' strokeWidth='2' />,
    <Polygon points='40,0 45,10 50,0' strokeWidth='2' />,
    <Polygon points='50,0 55,10 60,0' strokeWidth='2' />,
    <Polygon points='60,0 65,10 70,0' strokeWidth='2' />,
    <Polygon points='70,0 75,10 80,0' strokeWidth='2' />,
    <Polygon points='80,0 85,10 90,0' strokeWidth='2' />,
    <Polygon points='90,0 95,10 100,0' strokeWidth='2' />,
    <Polygon points='100,0 105,10 110,0' strokeWidth='2' />,
    <Polygon points='110,0 115,10 120,0' strokeWidth='2' />,
    <Polygon points='120,0 125,10 130,0' strokeWidth='2' />,
    <Polygon points='130,0 135,10 140,0' strokeWidth='2' />,
    <Polygon points='140,0 145,10 150,0' strokeWidth='2' />,
    <Polygon points='150,0 155,10 160,0' strokeWidth='2' />,
    <Polygon points='160,0 165,10 170,0' strokeWidth='2' />,
    <Polygon points='170,0 175,10 180,0' strokeWidth='2' />,
    <Polygon points='180,0 185,10 190,0' strokeWidth='2' />,
    <Polygon points='190,0 195,10 200,0' strokeWidth='2' />,
    <Polygon points='200,0 205,10 210,0' strokeWidth='2' />,
    <Polygon points='210,0 215,10 220,0' strokeWidth='2' />,
    <Polygon points='220,0 225,10 230,0' strokeWidth='2' />,
    <Polygon points='230,0 235,10 240,0' strokeWidth='2' />,
    <Polygon points='240,0 245,10 250,0' strokeWidth='2' />,
    <Polygon points='250,0 255,10 260,0' strokeWidth='2' />,
    <Polygon points='260,0 265,10 270,0' strokeWidth='2' />,
    <Polygon points='270,0 275,10 280,0' strokeWidth='2' />,
    <Polygon points='280,0 285,10 290,0' strokeWidth='2' />,
    <Polygon points='290,0 295,10 300,0' strokeWidth='2' />,
    <Polygon points='300,0 305,10 310,0' strokeWidth='2' />,
    <Polygon points='310,0 315,10 320,0' strokeWidth='2' />,
    <Polygon points='320,0 325,10 330,0' strokeWidth='2' />,
    <Polygon points='330,0 335,10 340,0' strokeWidth='2' />,
    <Polygon points='340,0 345,10 350,0' strokeWidth='2' />,
    <Polygon points='350,0 355,10 360,0' strokeWidth='2' />,
    <Polygon points='360,0 365,10 370,0' strokeWidth='2' />,
    <Polygon points='370,0 375,10 380,0' strokeWidth='2' />,
    <Polygon points='380,0 385,10 390,0' strokeWidth='2' />,
    <Polygon points='390,0 395,10 400,0' strokeWidth='2' />,
    <Polygon points='400,0 405,10 410,0' strokeWidth='2' />,
    <Polygon points='410,0 415,10 420,0' strokeWidth='2' />,
    <Polygon points='420,0 425,10 430,0' strokeWidth='2' />,
    <Polygon points='430,0 435,10 440,0' strokeWidth='2' />,
    <Polygon points='440,0 445,10 450,0' strokeWidth='2' />,
    <Polygon points='450,0 455,10 460,0' strokeWidth='2' />,
    <Polygon points='460,0 465,10 470,0' strokeWidth='2' />,
    <Polygon points='470,0 475,10 480,0' strokeWidth='2' />,
    <Polygon points='480,0 485,10 490,0' strokeWidth='2' />,
    <Polygon points='490,0 495,10 500,0' strokeWidth='2' />,
    <Polygon points='500,0 505,10 510,0' strokeWidth='2' />,
    <Polygon points='510,0 515,10 520,0' strokeWidth='2' />,
    <Polygon points='520,0 525,10 530,0' strokeWidth='2' />,
    <Polygon points='530,0 535,10 540,0' strokeWidth='2' />,
    <Polygon points='540,0 545,10 550,0' strokeWidth='2' />,
    <Polygon points='550,0 555,10 560,0' strokeWidth='2' />,
    <Polygon points='560,0 565,10 570,0' strokeWidth='2' />,
    <Polygon points='570,0 575,10 580,0' strokeWidth='2' />,
    <Polygon points='580,0 585,10 590,0' strokeWidth='2' />,
    <Polygon points='590,0 595,10 600,0' strokeWidth='2' />,
];
