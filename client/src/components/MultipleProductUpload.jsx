/* eslint-disable eqeqeq */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from "react";
import uploadimg from "./Assets/uploadimg.png";
import "./MultipleProductUpload.css";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Papa from "papaparse";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import { Link } from "react-router-dom";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import OutputDashboard from "./OutputDashboard";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "./context/auth/AuthState";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../base";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { hiIN } from "@mui/material/locale";
import Alert from "@mui/material/Alert";

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  hiIN
);

const MultipleProductUpload = ({ setdiableTabOne }) => {
  const { currentUser } = useAuth();
  const [droparea, setdroparea] = useState(false);
  const [CSVfile, setCSVfile] = useState(null);
  const [imageOpen, setimageOpen] = useState({ open: false, index: 0 });
  const [productCardDropArea, setproductCardDropArea] = useState(false);
  const [submitted, setsubmitted] = useState({
    submitted: false,
    error: false,
    errormsg: "",
    success: false,
  });
  const hiddenCSVFileInput = useRef(null);
  const hiddenImageFilesInput = useRef(null);
  const [ouptuResult, setOuptuResult] = useState(undefined);
  const [apiKey, setapiKey] = useState("");
  const [alertData, setalertData] = useState({
    alert: false,
    message: "",
    severity: "",
  });

  async function getUserData() {
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setapiKey(docSnap.data().apiKey);
      // console.log("Document data:", docSnap.data());
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  useEffect(() => {
    getUserData();
  }, [currentUser]);

  useEffect(() => {
    if (CSVfile) {
      setdiableTabOne(true);
    } else {
      setdiableTabOne(false);
    }
  }, [CSVfile, setdiableTabOne]);

  function showdroparea() {
    console.log("drag over");
    setdroparea(true);
  }

  function hidedroparea() {
    setdroparea(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    console.log("dropped");
    console.log(e.dataTransfer.files);
    handlefiles(e.dataTransfer.files);
  }

  function handleProductImageDrop(e) {
    e.preventDefault();
    handleProductImages(e.dataTransfer.files);
  }

  function handleProductImageButton(e) {
    e.preventDefault();
    console.log(e.target.files);
    handleProductImages(e.target.files);
  }

  function handleProductImages(array) {
    setCSVfile((prev) => {
      let newCSVfile = [...prev];
      let obj = { ...newCSVfile[imageOpen.index] };
      newCSVfile[imageOpen.index] = obj;

      let arr = [...newCSVfile[imageOpen.index].ProductImages];

      // Loop through dropped files
      for (let i = 0; i < array.length; i++) {
        const file = array[i];

        // Create a Blob for each file
        const reader = new FileReader();
        reader.onload = (event) => {
          const blob = new Blob([event.target.result], { type: file.type });

          // Push the Blob object into the ProductImages array
          arr.push({
            name: file.name,
            blob: blob,
          });

          // Update the state with the modified array
          setCSVfile((prev) => {
            let newCSVfile = [...prev];
            newCSVfile[imageOpen.index].ProductImages = arr;
            return newCSVfile;
          });
        };

        reader.readAsArrayBuffer(file);
      }
      return newCSVfile;
    });
  }

  function deleteImage(index) {
    setCSVfile((prev) => {
      let newCSVfile = [...prev];
      let obj = { ...newCSVfile[imageOpen.index] };
      newCSVfile[imageOpen.index] = obj;

      let arr = [...newCSVfile[imageOpen.index].ProductImages];
      arr.splice(index, 1); // Remove the image at the specified index

      newCSVfile[imageOpen.index].ProductImages = arr;
      return newCSVfile;
    });
  }

  function imageToBase64(imgBlob, mimeType) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(
            reader.result.split(",")[1] // Extracting base64 part
            //mimeType,
          );
        } else {
          reject(new Error("Failed to read image as base64."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading image."));
      };

      reader.readAsDataURL(imgBlob);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // validate data IF PRODUCT IMAGES ARE NOT NULL
    for (let i = 0; i < CSVfile.length; i++) {
      if (CSVfile[i].ProductImages.length === 0) {
        setalertData({
          alert: true,
          message: "Product Images cannot be NULL",
          severity: "error",
        });
        return;
      }
    }

    let data = [...CSVfile];
    data = await Promise.all(
      data.map(async (obj) => {
        let newObj = { ...obj };
        newObj.ProductImages = await Promise.all(
          newObj.ProductImages.map(async (imgObj) => {
            return await imageToBase64(imgObj.blob, imgObj.blob.type);
          })
        );
        return newObj;
      })
    );
    // validate data
    console.log({ data });
    // fetch data
    setsubmitted((prev) => {
      return { ...prev, submitted: true };
    });

    await submitDataToServer(data);
  }

  function submitDataToServer(data) {
    return fetch("/api/togemini/processall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data, apiKey }),
    })
      .then(async (response) => {
        if (response.ok) {
          const responseData = await response.json();
          setsubmitted((prev) => {
            return { ...prev, submitted: true, success: true };
          });
          setOuptuResult(responseData);

          return responseData;
        } else {
          setsubmitted((prev) => {
            return { ...prev, submitted: false, error: true };
          });
          return null;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setsubmitted((prev) => {
          return { ...prev, submitted: false, error: true, errormsg: error };
        });
        return null;
      });
  }

  function handlefiles(array) {
    console.log({ array });

    let jsonData = [];

    const processCSV = async (csvText, fileName) => {
      try {
        const result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        jsonData = result.data;
      } catch (error) {
        console.error(`Error parsing CSV file ${fileName}: ${error.message}`);
      }
    };

    const readFile = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          resolve(text);
        };
        reader.readAsText(file);
      });
    };

    const handleFile = async (file) => {
      const fileName = file.name;
      const csvText = await readFile(file);
      await processCSV(csvText, fileName);
    };

    const processFiles = async () => {
      for (let i = 0; i < array.length; i++) {
        if (array[i].type === "text/csv") {
          await handleFile(array[i]);
          break;
        }
      }

      // validate if jsonData is in correct format
      if (jsonData.length === 0) {
        setalertData({
          alert: true,
          message: "CSV file is empty or not in correct format",
          severity: "error",
        });
        return;
      }

      for (let i = 0; i < jsonData.length; i++) {
        if (
          !jsonData[i].ProductTitle ||
          !jsonData[i].ProductDescription ||
          !jsonData[i].ProductFeatures ||
          !jsonData[i].ProductInfo
        ) {
          setalertData({
            alert: true,
            message:
              "Product Title, Description, Features and Info cannot be NULL or the CSV file is not in correct format",
            severity: "error",
          });
          return;
        }
      }

      // Here, 'jsonArray' contains an array of objects with file names and corresponding JSON data
      console.log({ jsonData });
      jsonData = jsonData.map((obj, index) => {
        return {
          ...obj,
          ProductID: parseInt(index + 1),
          ProductImages: [],
          ProductTitle: obj.ProductTitle,
          ProductDescription: obj.ProductDescription,
          ProductFeatures: obj.ProductFeatures,
          ProductInfo: obj.ProductInfo,
        };
      });
      setCSVfile(jsonData);
    };

    processFiles();
  }

  const handleCSVButtonFileInput = (e) => {
    handlefiles(e.target.files);
  };

  const handleDownload = () => {
    // Assuming your CSV file is named 'sample.csv' and is located in the 'public' directory
    const downloadLink = "./Trial_pdt.csv";
    // Create a temporary anchor element
    const anchor = document.createElement("a");
    // Set the href attribute to the download link
    anchor.href = downloadLink;
    // Set the download attribute to specify the filename
    anchor.download = "Trial_pdt.csv";
    // Programmatically click the anchor element to trigger the download
    anchor.click();
  };

  const uploadFileBlock = () => {
    return (
      <>
        {alertData.alert && (
          <Alert variant="filled" severity={alertData.severity}>
            {alertData.message}
          </Alert>
        )}
        <div className="product-upload-parent" onDragOver={showdroparea}>
          {!CSVfile && (
            <div
              className="upload-file-area"
              onClick={() => hiddenCSVFileInput.current.click()}
            >
              <input
                type="file"
                accept=".csv"
                multiple
                hidden
                ref={hiddenCSVFileInput}
                onChange={handleCSVButtonFileInput}
              />
              <CloudUploadIcon className="cloud-icon" />
              <br />
              Drag and Drop CSV file here
            </div>
          )}
          {/* <Button
            className="download-temp-button"
            variant="contained"
            color="success"
          >
            Bulk Upload
          </Button> */}
          <Button
            variant="contained"
            className="download-temp-button"
            color="success"
            onClick={handleDownload}
          >
            Download Template
          </Button>
        </div>
        <div
          id="droparea"
          style={{ display: droparea ? "flex" : "none" }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            hidedroparea();
          }}
          onDrop={(e) => {
            e.preventDefault();
            hidedroparea();
            handleDrop(e);
          }}
        >
          <div id="dropareainnerdiv">
            <div id="dropareatext">
              <div className="aligndiv">
                <h1>Drop The Files Here</h1>
              </div>
              <br />
              <div className="aligndiv">
                <img
                  src={uploadimg}
                  style={{
                    maxWidth: "50%",
                    maxHeight: "50%",
                  }}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const productCard = () => {
    const shouldShowInstructions = !imageOpen.open;
    return (
      <>
        <IconButton
          aria-label="next product"
          disabled={imageOpen.index === 0}
          onClick={() =>
            setimageOpen((prev) => {
              return { ...prev, index: prev.index - 1 };
            })
          }
        >
          <ArrowBackIosIcon sx={{ color: "white" }} />
        </IconButton>
        <div
          className="product-card-parent"
          onDragOver={() => {
            setproductCardDropArea(true);
          }}
        >
          <div className="product-card">
            <h1
              className="Dnd-instructions"
              onClick={() => hiddenImageFilesInput.current.click()}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                ref={hiddenImageFilesInput}
                onChange={handleProductImageButton}
              />
              Drag and drop Images of the Catalog here
            </h1>

            <div className="product-card-image">
              {CSVfile[imageOpen.index].ProductImages.map((obj, index) => {
                return (
                  <div className="product-card-image-container" key={index}>
                    <img
                      src={URL.createObjectURL(obj.blob)}
                      alt={obj.name}
                      style={{ height: "100px", margin: "5px" }}
                    />
                    <div className="product-card-image-topright">
                      <IconButton
                        aria-label="delete"
                        onClick={() => deleteImage(index)}
                      >
                        <ClearIcon style={{ height: "10 px" }} />
                      </IconButton>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="product-card-details">
              <div className="product-card-title">
                <b>Title</b>
                {CSVfile[imageOpen.index].ProductTitle}
              </div>
              <div className="product-card-description">
                <b>Description</b>
                {CSVfile[imageOpen.index].ProductDescription}
              </div>
              <div className="product-card-features">
                <b>Features & Benefits</b>
                {CSVfile[imageOpen.index].ProductFeatures}
              </div>
              <div className="product-card-info">
                <b>Additional Information</b>
                {CSVfile[imageOpen.index].ProductInfo}
              </div>
              <Button
                variant="contained"
                color="success"
                className="submit-button"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </div>
          </div>
          <div
            className="product-card-overlay"
            style={{ display: productCardDropArea ? "flex" : "none" }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setproductCardDropArea(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setproductCardDropArea(false);
              handleProductImageDrop(e);
            }}
          >
            Drop your image
          </div>
        </div>
        <IconButton
          aria-label="previous product"
          disabled={imageOpen.index === CSVfile.length - 1}
          onClick={() =>
            setimageOpen((prev) => {
              return { ...prev, index: prev.index + 1 };
            })
          }
        >
          <ArrowForwardIosIcon sx={{ color: "white" }} />
        </IconButton>
      </>
    );
  };

  const excelSheetBlock = () => {
    const handleClose = (e) => {
      if (!e) return;
      if (!e.target.className.startsWith) return;
      if (!e.target.className.startsWith("MuiBackdrop-root")) return;
      setimageOpen({ open: false, index: 0 });
    };

    const handleViewImage = (i) => {
      setimageOpen({ open: true, index: i });
    };

    function handleChange(i, attr, val) {
      var newrecords = CSVfile.map((obj, index) => {
        if (index === i) {
          if (attr == "" && parseFloat(val))
            return { ...obj, [attr]: parseFloat(val) };
          return { ...obj, [attr]: val };
        }
        return obj;
      });

      setCSVfile(newrecords);
    }
    return (
      <>
        {alertData.alert && (
          <Alert variant="filled" severity={alertData.severity}>
            {alertData.message}
          </Alert>
        )}
        <h2 style={{ color: "red" }}>
          Upload Product images to get score.<br></br> Product images cannot be
          NULL.
        </h2>
        <table id="maintable">
          <thead>
            <tr>
              <th className="pdt-id">Product Id</th>
              <th className="sku">SKU</th>
              <th>Product Title</th>
              <th className="upimg">Product Images</th>
              <th>Product Description</th>
              <th>Product Features</th>
              <th>Product Info</th>
            </tr>
          </thead>

          <tbody>
            {CSVfile.map((value, i) => (
              <tr key={i}>
                {/* Product ID */}
                <td>
                  <ThemeProvider theme={theme}>
                    <TextareaAutosize
                      id="standard-textarea"
                      className="numberinput"
                      variant="standard"
                      type="number"
                      value={value.ProductID}
                      onChange={(e) =>
                        handleChange(i, "ProductID", e.target.value)
                      }
                    />
                  </ThemeProvider>
                </td>
                {/* SKU */}
                <td>
                  <TextareaAutosize
                    id="standard-textarea"
                    variant="standard"
                    type="text"
                    value={value.SKU}
                    onChange={(e) => handleChange(i, "SKU", e.target.value)}
                  />
                </td>
                {/* Product Title */}
                <td>
                  <ThemeProvider theme={theme}>
                    <TextareaAutosize
                      id="standard-textarea"
                      variant="standard"
                      type="text"
                      value={value.ProductTitle}
                      onChange={(e) =>
                        handleChange(i, "ProductTitle", e.target.value)
                      }
                    />
                  </ThemeProvider>
                </td>
                {/* Product Images */}
                <td>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    style={{ width: "30px", height: "40px" }}
                    onClick={() => handleViewImage(i)}
                  ></Button>
                </td>
                {/* Product Description */}
                <td>
                  <TextareaAutosize
                    id="standard-textarea"
                    variant="standard"
                    type="text"
                    value={value.ProductDescription}
                    onChange={(e) =>
                      handleChange(i, "ProductDescription", e.target.value)
                    }
                  />
                </td>
                {/* Product Features */}
                <td>
                  <TextareaAutosize
                    id="standard-textarea"
                    variant="standard"
                    type="text"
                    value={value.ProductFeatures}
                    onChange={(e) =>
                      handleChange(i, "ProductFeatures", e.target.value)
                    }
                  />
                </td>
                {/* Product Info */}
                <td>
                  <TextareaAutosize
                    id="standard-textarea"
                    variant="standard"
                    type="text"
                    value={value.ProductInfo}
                    onChange={(e) =>
                      handleChange(i, "ProductInfo", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="buttons-multi-sc">
          <Button
            variant="contained"
            color="success"
            className="submit-button"
            onClick={handleSubmit}
          >
            Submit
          </Button>

          <Link to="/feedback">
            <Button variant="contained" className="feedback-button">
              Give Feedback
            </Button>
          </Link>
        </div>

        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={imageOpen.open}
          onClick={handleClose}
        >
          {productCard()}
        </Backdrop>
      </>
    );
  };

  return !CSVfile ? (
    uploadFileBlock()
  ) : submitted.submitted === false ? (
    excelSheetBlock()
  ) : submitted.success === true ? (
    <OutputDashboard data={ouptuResult} />
  ) : (
    <div className="progress">
      <CircularProgress />
      <br />
      Please wait while we process your request
    </div>
  );
};

export default MultipleProductUpload;
