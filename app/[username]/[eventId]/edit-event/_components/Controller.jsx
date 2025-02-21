import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import Themes from "../../../../_data/Themes";
import GradientBg from "../../../../_data/GradientBg";
import { Button } from "../../../../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../../../../components/ui/radio-group";
import { Textarea } from "../../../../../components/ui/textarea";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { db } from "../../../../../lib/prisma";
import { getEventData } from "../../../../../actions/events";

const Controller = ({
  selectedTheme,
  alreadySelectedTheme,
  selectedBackground,
  allowGuestSelection,
  introVideoSelection,
  redirectUrl,
  confirmationPageText,
  confPageSelection,
  params,
}) => {
  const [showMore, setShowMore] = useState(6);
  const [dbData, setDbData] = useState();
  const [redirectUrlValue, setRedirectUrlValue] = useState("");
  const [introVideoSelectionValue, setIntroVideoSelectionValue] = useState("");
  const [showRedirectUrl, setShowRedirectUrl] = useState(false);
  const [allowGuest, setAllowGuest] = useState(true);
  const [confirmationPageTextValue, setConfirmationPageTextValue] = useState(
    "Thanks for scheduling. Your event has been successfully scheduled."
  );
  const [confPageSelectionValue, setConfPageSelectionValue] = useState("");
  const [confPageTextinDb, setConfPageTextinDb] = useState();
  const [redirectUrlTextinDb, setRedirectUrlTextinDb] = useState();

  useEffect(() => {
    console.log(params); //it says {formid: 4} or whatever the current formid of the form
    params && GetFormData();
  }, [params]);

  const GetFormData = async () => {
    const eventId = await params.eventId;
    try {
      const result = await getEventData(eventId);
      console.log("result in contraoller", result);
      setConfPageSelectionValue(result?.confPageSelection);
      setConfPageTextinDb(result?.confirmationPageText);
      setRedirectUrlTextinDb(result?.redirecturl);
      setIntroVideoSelectionValue(result?.introVideoLink);
      setAllowGuest(result?.allowGuest);
      console.log("allowGuest", allowGuest);
      setDbData(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRedirectSubmit = (e) => {
    e.preventDefault();
    console.log("redirecturl value is", redirectUrlValue);
    redirectUrl(redirectUrlValue);
    confPageSelection("redirecturl");
  };

  const handleConfPageSubmit = (e) => {
    e.preventDefault();
    confirmationPageText(confirmationPageTextValue);
    confPageSelection("defaultConfirmationPage");
    // disabled = { showRedirectUrl };
  };

  const handleIntroVideoSubmit = (e) => {
    e.preventDefault();
    introVideoSelection(introVideoSelectionValue);
    // disabled = { showRedirectUrl };
  };

  return (
    <>
      {/* Theme selection controller */}
      <h2 className="my-3">
        <strong>Select Theme</strong>
      </h2>
      <Select onValueChange={(value) => selectedTheme(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={alreadySelectedTheme ? alreadySelectedTheme : "Theme"} />
        </SelectTrigger>
        <SelectContent>
          {Themes.map((theme, index) => (
            <SelectItem value={theme.theme} key={index}>
              <div className="flex gap-3">
                <div className="flex">
                  <div
                    className="h-5 w-5 rounded-l-md"
                    style={{ backgroundColor: theme.primary }}
                  ></div>
                  <div
                    className="h-5 w-5"
                    style={{ backgroundColor: theme.secondary }}
                  ></div>
                  <div
                    className="h-5 w-5"
                    style={{ backgroundColor: theme.accent }}
                  ></div>
                  <div
                    className="h-5 w-5 rounded-r-md"
                    style={{ backgroundColor: theme.neutral }}
                  ></div>
                </div>
                {theme.theme}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Background selection controller */}
      <h2 className="my-5">
        <strong>Select Background</strong>
      </h2>
      <div className="grid grid-cols-3 gap-5">
        {GradientBg.map(
          (bg, index) =>
            index < showMore && (
              <div
                key={index}
                onClick={() => selectedBackground(bg.gradient)}
                className="w-full h-[70px] rounded-lg cursor-pointer hover:border-black hover:border-2 flex items-center justify-center"
                style={{ background: bg.gradient }}
              >
                {index == 0 && "No fill"}
              </div>
            )
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full my-1"
        onClick={() => setShowMore(showMore > 6 ? 6 : 20)}
      >
        {showMore > 6 ? "Show Less" : "Show More"}
      </Button>

           {/* Add videoText link  */}
      {dbData && (
        <div className="mt-2">
          <div className="mt-5 mb-2">
            <strong>Introduction video Link</strong><p className="text-sm text-gray-500">This video will be displayed on booking page (optional)</p>
          </div>
         
                 
              <form onSubmit={handleIntroVideoSubmit}>
                <div className="lg:flex items-center space-x-2">
                  <Input
                    type="text"
                    className="focus:outline-slate-300"
                    placeholder="e.g. https://www.youtube.com/watch?v=myIntroVideo"
                    defaultValue={
                      introVideoSelectionValue
                        ? introVideoSelectionValue
                        : ""
                    }
                    onChange={(e) => {
                      setIntroVideoSelectionValue(e.target.value);
                
                    }}
                  />
                  <Button
                    className="my-3"
                    type="submit"
                  >
                    Save
                  </Button>
                </div>
              </form>
       
        </div>
      )}

        {/* Letting users to add guests */ }
      {dbData && (
        < div className="mt-2">
      <div className="my-5">
        <strong>Do you want to let the attendee Add Guests?</strong>
      </div>

      <div className="my-3">
        <RadioGroup defaultValue={allowGuest ? "yes" : "no"} className="flex items-center space-x-2">

          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="yes"
              id="r3"
              onClick={() => {
                setAllowGuest(true)
                allowGuestSelection(true)
                GetFormData()
              }}
            />
            <Label htmlFor="r3">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="no"
              id="r4"
              onClick={() => {
                setAllowGuest(false)
                allowGuestSelection(false)
                GetFormData()
              }}
            />
            <Label htmlFor="r4">No</Label>
          </div>
       
        </RadioGroup>
      </div>
    </div > 
  )
      }
      
 


      {/* Redirect url  */}

      {dbData && (
        <div className="mt-2">
          <div className="my-5">
            <strong>Confirmation page</strong>
          </div>

          <div className="my-3">
            <RadioGroup
              defaultValue={
                confPageSelectionValue
                  ? confPageSelectionValue
                  : "defaultConfirmationPage"
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="defaultConfirmationPage"
                  id="r1"
                  onClick={() => setShowRedirectUrl(false)}
                />
                <Label htmlFor="r1">Display Confirmation Page</Label>
              </div>
              <form onSubmit={handleConfPageSubmit}>
                <div className="my-3 lg:flex items-center space-x-2">
                  <Textarea
                    type="text"
                    className="focus:outline-slate-300"
                    // placeholder="Thanks for submitting the form. Your form is successfully submitted."
                    defaultValue={
                      confPageTextinDb
                        ? confPageTextinDb
                        : "Thanks for scheduling. Your event has been successfully scheduled."
                    }
                    onChange={(e) => {
                      setConfirmationPageTextValue(e.target.value);
                      setShowRedirectUrl(false);
                    }}
                  />
                  <Button
                    className="my-3"
                    type="submit"
                    disabled={showRedirectUrl}
                  >
                    Save
                  </Button>
                </div>
              </form>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="redirecturl"
                  id="r2"
                  onClick={() => setShowRedirectUrl(true)}
                />
                <Label htmlFor="r2">Redirect to an external site</Label>
              </div>
              {showRedirectUrl && (
                <form onSubmit={handleRedirectSubmit}>
                  <div className="lg:flex w-full items-center space-x-2">
                    <Input
                      type="text"
                      className="focus:outline-slate-300"
                      defaultValue={redirectUrlTextinDb}
                      placeholder="https://www.example.com/"
                      onChange={(e) => setRedirectUrlValue(e.target.value)}
                      required
                    />
                    <Button
                      // variant="outline"
                      type="submit"
                      // onClick={(e) => {
                      //   e.preventDefault();
                      //   redirectUrl(redirectUrlValue);
                      //   confPageSelection("redirecturl");
                      // }}
                    >
                      Save
                    </Button>
                  </div>
                </form>
              )}
            </RadioGroup>
          </div>
        </div>
      )}
    </>
  );
};

export default Controller;
