# SVG to PNG (@1x @2x @3x)

This is a command-line tool for converting SVG to PNG in multiple resolutions (@1x @2x @3x)

## Install

```sh
npm install -g svg2pngs
```
or 
```sh
yarn global add svg2pngs
```

## Usage
 
Let's assume you have a project with multiple *.svg files in multiple sub-folders like this:

```sh
app
  ├── images
  │   ├── Image1.svg
  │   └── Image2.svg
  └── main-images
      ├── small-images
      │   └── Image3.svg
      ├── Image4.svg
      └── Image5.svg
```

You have to cd into the main folder and run the following command:

```sh
cd app
svg2pngs
```

This will walk though the entire folder structure and create the associated *png files in 3 resolutions @1x, @2x and @3x.

The end result would be something like this:

```sh
app
  ├── images
  │   ├── Image1.svg
  │   └── Image2.svg
  └── main-images
      ├── small-images
      │   └── Image3.svg
      ├── Image4.svg
      └── Image5.svg
```

Enjoy !

#### Disclosure
This project is based on * [Rebar's tool](http://codefoundries.com/developer/rebar-architecture/units/tools/build-app-images.html).

