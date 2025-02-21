"use client";
import { db } from "../../../../lib/prisma";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  MonitorStop,
  QrCode,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import FormUi from "./_components/FormUi";
import Controller from "./_components/Controller";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {QRCodeCanvas as QRCode} from "qrcode.react";
import html2canvas from "html2canvas-pro";
import { getEventData, updateControllerFields, updateEventData } from "../../../../actions/events";
import { useToast } from "../../../../hooks/use-toast";

const EditForm = ({ params }) => {
  const { user } = useUser();
  const router = useRouter();
  const [jsonForm, setJsonForm] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState();
  const [record, setRecord] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [alreadySelectedTheme, setAlreadySelectedTheme] = useState("light");
  const [selectedBackground, setSelectedBackground] = useState();
  const [embedCode, setEmbedCode] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const { toast } = useToast();

  // Unwrap params using React.use()
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [firstLastName, setFirstLastName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setUnwrappedParams(resolvedParams);
    };

    unwrapParams();
  }, [params]);

  const getFormData = async () => {
    if (!unwrappedParams) return;
    try {  
      setIsLoading(true);
      const eventId = unwrappedParams.eventId;
      const result = await getEventData(eventId);
      console.log("result is", result.questions);
      setFirstLastName(result.addFirstLastName);
      console.log("firstLastName is", firstLastName);
      setRecord(result);
      setJsonForm(result.questions);
      setAlreadySelectedTheme(result.theme);
      setSelectedBackground(result.background);
    } catch (error) {
      console.log("Error from getFormData", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && unwrappedParams) {
      getFormData();
    }
  }, [user, unwrappedParams]);

  // Edit form -- start
  useEffect(() => {
    if (updateTrigger) {
      setJsonForm(jsonForm);
      updateJsonFormInDb();
    }
  }, [updateTrigger]);

  const onFieldUpdate = (value, index) => {
    console.log(value, index);
    jsonForm.fields[index].label = value.label;
    jsonForm.fields[index].placeholder = value.placeholder;
    jsonForm.fields[index].required = value.required;
    jsonForm.fields[index].options = value.options;
    console.log(jsonForm);
    setUpdateTrigger(Date.now()); // We want to update  setJsonForm(jsonForm) everytime we execute onFieldUpdate, so we put the time here as time changes everytime, it can execute the above useEffect()
  };

  // We update the jsonform in db with updated one, while updating, we are checking jsonform id and user email address should match
   const updateJsonFormInDb = async () => {
    try {
      const result = await updateEventData(record.id, jsonForm)
      if (result.success) {
        toast({
          title: "Success!",
          description: "Form updated successfully!",
          className: "text-left",
          position: "top-right",
        });
      } else {
        throw new Error(result.error);
      } 
    } catch (error) {
      console.log("Error from update form", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
        className: "text-left",
        position: "top-right",
      });
    }
  };

  const deleteField = (indexToRemove) => {
    const result = jsonForm.fields?.filter(
      (item, index) => index != indexToRemove
    );
    // console.log(result);
    jsonForm.fields = result;
       toast({
          title: "Success!",
          description: "Field deleted successfully!",
          className: "text-left",
          position: "top-right",
        });
    setUpdateTrigger(Date.now());
  };
  // Edit form -- end --------------------

  

  // Add field ----- start ----

  const handleAddField = (newFieldData, index) => {
    const newField = {
      fieldName: newFieldData.label.toLowerCase().replace(/\s+/g, ""),
      fieldTitle: newFieldData.label,
      fieldType: newFieldData.fieldType,
      placeholder: newFieldData.placeholder,
      label: newFieldData.label,
      options: newFieldData.options,
      required: newFieldData.fieldRequired,
    };

    const updatedFields = [...jsonForm?.fields];
    // console.log(updatedFields);
    updatedFields.splice(index + 1, 0, newField);
    // console.log(updatedFields);
    // setFields(updatedFields);
    updateAddFieldFormInDb(record.id, updatedFields);
  };

  const updateAddFieldFormInDb = async ( recordId, updatedFields) => {
    const updatedForm = { ...jsonForm, fields: updatedFields };
  try {
      
    const result = await updateEventData(recordId, updatedForm)
    console.log("result is", result)
      if (result.success) {
        toast({
          title: "Success!",
          description: "Form updated successfully!",
          className: "text-left",
          position: "top-right",
        });
        router.refresh();
      } else {
        throw new Error(result.error);
      }
        
      
    } catch (error) {
      console.log("Error from update form", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
        className: "text-left",
        position: "top-right",
      });
    }
};

  // Add field ----- end ----
  const handleControllerUpdate = async (value, columnName) => {
    if (!value || !columnName || !record?.id) {
      console.error("Missing required values:", { value, columnName, recordId: record?.id });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required values",
        className: "text-left",
        position: "top-right",
      });
      return;
    }

    try {
      const result = await updateControllerFields(record.id, columnName, value);
      if (result.success) {
        toast({
          title: "Success!",
          description: "Form updated successfully!",
          className: "text-left",
          position: "top-right",
        });
        await getFormData(); // Make sure to await this
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error from update form", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong",
        className: "text-left",
        position: "top-right",
      });
    }
  };

  const generateEmbedCode = async () => {

    try {
      // widget.js is in the public folder so it can be accessed without signing in
      const embedHtml = `
       <iframe src="${process.env.NEXT_PUBLIC_APP_URL}book/${unwrappedParams?.username}/${unwrappedParams?.eventId}" loading="lazy" width="100%" height="700" frameborder="0" marginheight="0" marginwidth="0"></iframe>
      `;
      //       const embedHtml = `
      //        <!-- Custom Form Widget begin -->
      // <div id="custom-form-widget-1" class="custom-form-widget" data-url=${process.env.NEXT_PUBLIC_BASE_URL}aiform/${formId}></div>
      // <script type="text/javascript" src=${process.env.NEXT_PUBLIC_BASE_URL}widget.js async></script>
      // <!-- Custom Form Widget end -->
      //       `;

      setEmbedCode(embedHtml);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error generating embed code:", error);
      toast.error("Failed to generate embed code");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Function to handle copying the embed code
 const handleCopyEmbedCode = async () => {
  try {
    await navigator.clipboard.writeText(embedCode);
    toast({
      title: "Success!",
      description: "Embed code copied to clipboard!",
      className: "text-left",
      position: "top-right",
    });
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to copy embed code",
      className: "text-left",
      position: "top-right",
    });
  }
};

  const downloadQR = async () => {
    const canvas = await html2canvas(
      document.querySelector(".qr-code-container")
    );
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg");
    link.download = `peposcheduler-${unwrappedParams?.eventId}.jpg`;
    link.click();
  };

  return (
    <div className="p-10">
      {isLoading ? (
        <div className="h-[80vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-sm text-gray-600">Loading event data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="lg:flex lg:justify-between lg:items-center">
            {/* To go back to the previous page when hitting the back button */}
            <Link
              className="flex gap-2 items-center my-5 cursor-pointer hover:font-bold"
              href="/events"
            >
              <ArrowLeft />
              Back
            </Link>
            <div className="lg:flex lg:gap-2 my-4">
              <div className="my-2">
                <Button
                  onClick={generateEmbedCode}
                  className="flex gap-2 bg-cyan-500 w-full lg:w-[230px]"
                >
                  <MonitorStop /> Generate Embed Code
                </Button>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Embed Code</DialogTitle>
                      <div className="mt-4">
                        <textarea
                          readOnly
                          value={embedCode}
                          className="w-full p-2 border rounded "
                          rows="6"
                        />
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={handleCloseDialog}>
                            Cancel
                          </Button>
              
                            <Button className="" onClick={handleCopyEmbedCode}>Copy Embed Code</Button>
               
                        </div>
                      </div>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
              {/* targer=_blank is for opening the link in a new tab */}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}book/${unwrappedParams?.username}/${unwrappedParams?.eventId}`} target="_blank">
                <Button className="flex gap-2 my-2 w-full lg:w-[180px]">
                  <SquareArrowOutUpRight />
                  Live Preview
                </Button>
              </Link>

             
              <Button
                className="flex gap-2 my-2 w-full lg:w-[130px]"
                onClick={() => setOpenQrDialog(true)}
              >
                <QrCode />
                QR Code
              </Button>
              <Dialog open={openQrDialog} onOpenChange={setOpenQrDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Get the QR Code</DialogTitle>
                    <div className="my-4">
                      Scan this QR code to launch your PepoForm.
                      <div className="my-2 flex justify-center qr-code-container">
                        {record?.id && (
                          <QRCode
                            value={
                              `${process.env.NEXT_PUBLIC_APP_URL}book/${unwrappedParams?.username}/${unwrappedParams?.eventId}`
                            }
                            size={270}
                          />
                        )}
                      </div>
                      <div className="flex gap-3 mt-5 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setOpenQrDialog(false)}
                        >
                          Cancel
                        </Button>

                        <Button
                          className="bg-black text-white"
                          onClick={downloadQR}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="p-5 border rounded-lg shadow-md">
               <Controller
          selectedTheme={(value) => {
            handleControllerUpdate(value, "theme");
            setSelectedTheme(value);
          }}
          selectedBackground={(value) => {
            handleControllerUpdate(value, "background");
            setSelectedBackground(value);
          }}
          allowGuestSelection={(value) => {
            handleControllerUpdate(value, "allowGuest");
          }}
          introVideoSelection={(value) => {
            handleControllerUpdate(value, "introVideoLink");
          }}
          redirectUrl={(value) => {
            handleControllerUpdate(value, "redirecturl");
          }}
          confirmationPageText={(value) => {
            handleControllerUpdate(value, "confirmationPageText");
          }}
          confPageSelection={(value) => {
            handleControllerUpdate(value, "confPageSelection");
          }}
                  params={unwrappedParams}
                  alreadySelectedTheme={alreadySelectedTheme}
        />
            </div>
            <div
              className="md:col-span-2 border rounded-lg p-5 flex items-center justify-center"
              style={{ backgroundImage: selectedBackground }}
            >
              <FormUi
                jsonForm={jsonForm}
                selectedTheme={alreadySelectedTheme}
                onFieldUpdate={onFieldUpdate}
                handleAddField={handleAddField}
                deleteField={(index) => deleteField(index)}
                firstLastName={firstLastName}
                addFirstLastName={(value) => {
                  handleControllerUpdate(value, "addFirstLastName");
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditForm;
