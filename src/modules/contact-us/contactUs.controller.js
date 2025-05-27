import ContactUs from "../../../db/models/contactUs.model.js";
import { sendCustomerSupportEmail } from "../../utils/email.js";
import { customerSupportTemplate } from "../../utils/htmlTemplate.js";

export const submitContactForm = async (req, res) => {

    const { name, email, phoneNumber, message } = req.body;

    if (!name || !email || !phoneNumber || !message) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }
    const contactUsData = {
        name,
        email,
        phoneNumber,
        message
    };
   const submit = await ContactUs.create(contactUsData)
    if (!submit) {
        return res.status(500).json({
            success: false,
            message: "Failed to submit contact form"
        });
    }
    //send email to customer support c2122m0402@gmail.com
 const emailData = {
    to: "c2122m0402@gmail.com", // Customer Support Email
    subject: "🆕 New Contact Form Submission",
    html: customerSupportTemplate({ name, email, phoneNumber, message })
  };

  try {
    await sendCustomerSupportEmail(emailData);
  } catch (err) {
    console.error("Failed to send contact form email:", err);
  }


    return res.status(201).json({
        success: true,
        message: "Contact form submitted successfully",
        data: contactUsData
    });

}


export const getcontactFormData = async(req,res)=>{

    const data = await ContactUs.findAll();
    if (!data || data.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No contact form data found"
        });
    }
    return res.status(200).json({
        success: true,
        message: "Contact form data retrieved successfully",
        data
    });




}