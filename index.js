#!/usr/bin/env node

const xml = require("node-xml-lite");
const fs = require("fs");
const path = require("path");
const util = require("util");
const svg2png = require("svg2png");

const dirExcludes = ['node_modules', '.git'];

function renderPrettyDate(uglyDate) {
    return uglyDate.toISOString();
}

function parseDimension(dimensionValue, dimensionName, directoryName, imageName) {
    const dimensionAsString = dimensionValue;
    const dimensionAsInt = parseInt(dimensionAsString)

    if (!dimensionAsString.endsWith("px") && ("" + dimensionAsInt) !== dimensionAsString) {
        throw new Error(dimensionName + " must end with px, but it rather is: " + dimensionAsString);
    }

    if (dimensionAsInt == NaN) {
        throw new Error(dimensionName + " must be integer, but it rather is: " + dimensionAsString);
    }

    return dimensionAsInt
}

function getLastModifiedDateTimeForFile(fileName) {
    const stats = fs.statSync(fileName)
    return new Date(util.inspect(stats.mtime))
}

function convertSingleSVG2PNGWithAmplification(svgData, directoryName, imageName, amplification) {
    try {

        if (!(svgData.buffer)) {
            // Determine the SVG file name
            const svgFileName = path.resolve(directoryName, imageName + '.svg')

            // Read file
            const svgBuffer = fs.readFileSync(svgFileName)

            // Read as XML and get width and height
            const svgXml = xml.parseBuffer(svgBuffer)
            const width = parseDimension(svgXml.attrib.width, "Width", directoryName, imageName)
            const height = parseDimension(svgXml.attrib.height, "Height", directoryName, imageName)

            // Get last modified date/time
            const lastModified = getLastModifiedDateTimeForFile(svgFileName)

            Object.assign(svgData, {
                buffer: svgBuffer,
                width,
                height,
                lastModified
            })

            console.log("Processing SVG: " + svgFileName + ", last modified: " + renderPrettyDate(lastModified))
        }

        // Determine PNG file name
        const amplificationString = amplification > 1 ? '@' + amplification + 'x' : ''
        const pngFileName = path.resolve(directoryName, imageName + amplificationString + '.png')

        // Determine last modified and compare to SVG. Use 1/1/1970 if not found so that SVG appears older
        let pngLastModified = null

        try {
            pngLastModified = getLastModifiedDateTimeForFile(pngFileName)
        } catch (err) {
            if (err.code === 'ENOENT') {
                pngLastModified = new Date(0);
            } else {
                throw err
            }
        }

        if (pngLastModified <= svgData.lastModified) {
            const width = amplification * svgData.width
            const height = amplification * svgData.height

            console.log("Rendering PNG: " + pngFileName + ", width: " + width + ", height: " + height)

            const pngBuffer = svg2png.sync(svgData.buffer, {
                width,
                height
            })
            fs.writeFileSync(pngFileName, pngBuffer)
        } else {
            console.log("Skipping PNG: " + pngFileName + ", last modified: " + renderPrettyDate(pngLastModified))
        }
    } catch (err) {
        throw new Error("Could not convert " + directoryName + "." + imageName + ".svg because: " + err.message)
    }
}

function convertSingleSVG2PNG(directoryName, svgName) {
    const imageName = svgName.substring(0, svgName.length - 4)

    const svgData = {}

    convertSingleSVG2PNGWithAmplification(svgData, directoryName, imageName, 1)
    convertSingleSVG2PNGWithAmplification(svgData, directoryName, imageName, 2)
    convertSingleSVG2PNGWithAmplification(svgData, directoryName, imageName, 3)
}

function searchAndConvertSVG2PNG(directoryName) {
    const dirItems = fs.readdirSync(directoryName);
    //console.log(dirItems);

    dirItems.forEach(fileName => {
        if (dirExcludes.indexOf(fileName) !== -1) {
            return false;
        } else if (fs.statSync(directoryName + fileName).isDirectory()) {
            const subDir = path.resolve(directoryName, fileName) + '/';
            searchAndConvertSVG2PNG(subDir);
        } else if (fileName.endsWith('.svg')) {
            convertSingleSVG2PNG(directoryName, fileName)
        } else {
            return true;
        }
    });
}

searchAndConvertSVG2PNG('./');
