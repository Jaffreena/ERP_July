using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Wordprocessing;
using ERP.DataList;
using ERP.Models;
using ERP_DAO;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using SelectPdf;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Text.Json;

namespace ERP.Controllers.JobworkInward
{
    public class JobWorkInvoiceController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();
        JW_Invoice_DL JW_Inv_DL = new JW_Invoice_DL();
        List<JobWorkInvoiceSummary_DTO> SIR_List = new List<JobWorkInvoiceSummary_DTO>();
        List<JobWorkInvoiceDetail_DTO> SIR_List_detail = new List<JobWorkInvoiceDetail_DTO>();
        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;
        Int32? DPageNumber;
        Int32 DPageSize;

        #region JobInvoice Edit
        public IActionResult Edit(long SI_No)
        {
            GetJobWorkInvoiceData();
            ViewBag.Collapse = true;
            return View();
        }
        #endregion

        #region date chnage

        [HttpGet]
        [Route("jwinvoice/transactions/jwinvoice/numbering")]
        public string OnJWInvoiceNumber(Int32 PODate)
        {
            DateTime invoiceDate = DateTime.ParseExact(
                PODate.ToString(),
                "yyyyMMdd",
                CultureInfo.InvariantCulture);

            JobWorkInvoiceCreate_DTO INV_DTO = new JobWorkInvoiceCreate_DTO();
            INV_DTO.Header.JIJWIH_InvoiceDate = invoiceDate;
            INV_DTO.Header.JW_Inv_Id = 0;


            JobWorkInvoice_DAO INV_DAO = new JobWorkInvoice_DAO();
            DS = INV_DAO.JobWorkInvoice(INV_DTO);
            if (DS.Tables[0].Rows.Count == 0 || DS.Tables[1].Rows.Count == 0)
            {
                ViewBag.ErrorCode = 2;
                ViewBag.ErrorMessage = "JW Invoice Number is not configured for the selected Invoice Date.";
                return "";
            }

            // Manual Numbering
            int order = Convert.ToInt32(DS.Tables[0].Rows[0]["JIN_Method"]);
            if (order != 2)
                return "";

            string prefix = "";
            string suffix = "";
            string prefill = "";
            int number = 0;

            // Prefix
            if (DS.Tables[2].Rows.Count > 0)
                prefix = DS.Tables[2].Rows[0]["JIP_Particulars"].ToString();

            // Suffix
            if (DS.Tables[3].Rows.Count > 0)
                suffix = DS.Tables[3].Rows[0]["JIS_Particulars"].ToString();

            // Reset Configuration
            int startNumber = Convert.ToInt32(DS.Tables[1].Rows[0]["JIR_StartingNumber"]);
            int digit = Convert.ToInt32(DS.Tables[1].Rows[0]["JIR_NumberofDigits"]);
            int prefillZero = Convert.ToInt32(DS.Tables[1].Rows[0]["JIR_PrefilZero"]);

            if (prefillZero == 1)
                prefill = "D" + digit;

            // Running Number
            if (DS.Tables[4].Rows.Count > 0)
            {
                int runningNumber = Convert.ToInt32(DS.Tables[4].Rows[0]["StartingNumber"]);
                number = runningNumber + 1;
            }
            else
            {
                number = startNumber;
            }

            return prefix + number.ToString(prefill) + suffix;
        }

        #endregion
        public IActionResult Create()
        {
            GetJobWorkInvoiceData();
            ViewBag.Collapse = true;
            return View();
        }

        JIJWI_Numbering_DTO PON_DTO = new JIJWI_Numbering_DTO();
        JIJWI_Numbering_DAO PON_DAO = new JIJWI_Numbering_DAO();
        void On_JI_NumberGen(Int32 JIDate)
        {
            DataSet DS1 = new DataSet();

            PON_DTO.JIJWI_Date = JIDate.ToString();
            PON_DTO.CreatorCode = 1;
            PON_DTO.Id = 101;

            DS1 = PON_DAO.JIJWI_NumberingDB(PON_DTO);

            if (DS1.Tables[0].Rows.Count > 0)
            {
                Int32 Order = Convert.ToInt32(DS1.Tables[0].Rows[0]["JIJWI_Method"].ToString());

                if (Order == 2)
                {
                    if (DS1.Tables[1].Rows.Count > 0)
                    {
                        // Existing range -> increment
                        Int32 Number = Convert.ToInt32(DS1.Tables[1].Rows[0]["StartingNumber"].ToString());

                        PON_DTO.JIJWI_Number = Convert.ToInt32(DS1.Tables[1].Rows[0]["JIJWI__NRS_Number"].ToString());
                        PON_DTO.JIJWI_StartingNumber = Convert.ToString(Number + 1);
                        PON_DTO.CreatorCode = 1;
                        PON_DTO.Id = 103;

                        PON_DAO.JIJWI_NumberingDB(PON_DTO);
                    }
                    else if (DS1.Tables[2].Rows.Count > 0)
                    {
                        // New range -> insert fresh, using Setup dates directly (no Frequency calculation)
                        DateTime StartDate = Convert.ToDateTime(DS1.Tables[2].Rows[0]["JIJWI__NRS_StartDate"].ToString());
                        DateTime EndDate = Convert.ToDateTime(DS1.Tables[2].Rows[0]["JIJWI__NRS_EndDate"].ToString());
                        Int32 Start = Convert.ToInt32(DS1.Tables[2].Rows[0]["JIJWI__NRS_StartingNumber"].ToString());

                        PON_DTO.JIJWI_Number = Convert.ToInt32(DS1.Tables[2].Rows[0]["JIJWI__NRS_Number"].ToString());
                        PON_DTO.JIJWI_StartingNumber = Convert.ToString(Start);
                        PON_DTO.JIJWI_Date = Convert.ToString(StartDate.ToString("yyyyMMdd"));
                        PON_DTO.JIJWI_Method = Convert.ToString(EndDate.ToString("yyyyMMdd"));
                        PON_DTO.CreatorCode = 1;
                        PON_DTO.Id = 102;

                        PON_DAO.JIJWI_NumberingDB(PON_DTO);
                    }
                    // else: இந்த Date-க்கு ஒரு Reset range-கூட setup பண்ணல -> insert நடக்காது
                }
            }
        }
        public void GetJobWorkInvoiceData()
        {
            JobWorkInvoiceCreate_DTO DN_DTO = new JobWorkInvoiceCreate_DTO();
            JobWorkInvoice_DAO DN_DAO = new JobWorkInvoice_DAO();
            DN_DTO.Header.JIJWIH_InvoiceDate = DateTime.Now;
            DN_DTO.Header.JW_Inv_Id = 1;

            DataSet DS = new DataSet();
            DS = DN_DAO.JobWorkInvoice(DN_DTO);
            ViewBag.Currency = Help.GetCat(DS.Tables[4]);
            ViewBag.UoM = Help.GetCat(DS.Tables[5]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[7]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[11]);
            ViewBag.Process = Help.GetCat(DS.Tables[12]);
            ViewBag.SAC = Help.GetCat(DS.Tables[13]);
            ViewBag.SON = Help.GetCat(DS.Tables[14]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[15]);

        }

        [HttpGet]
        [Route("jobworkinvoice/transactions/jobworkinvoice/next-jwi-number")]
        public string OnJobworkInvoiceNextNumber(DateTime JWIDate)
        {
            JWI_NextNumber_DTO DTO = new JWI_NextNumber_DTO();
            DTO.Id = 101;
            DTO.JWIDate = JWIDate;
            DTO.CreatorCode = Convert.ToInt32(0);

            try
            {
                DTO = new JWI_NextNumber_DAO().JWINextNumberDB(DTO);
            }
            catch (Exception ex)
            {
                ViewBag.ErrorCode = 2;
                ViewBag.ErrorMessage = "Invoice Number is not configured for the selected Invoice Date.";
                return "";
            }

            return DTO.FinalJWINumber;
        }

        #region GET DELIVERY NOTE ITEMS

        // Get delivery note items using customer number and return JSON
        [HttpGet]
        public JsonResult GetDeliveryNoteItems(long CustomerNumber)
        {
            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();

            DataTable dt = dao.GetDeliveryNoteItemsDB(CustomerNumber).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                JIDNI_JIDNH_Number = r["JIDNI_JIDNH_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNI_JIDNH_Number"]),

                JIDNI_Number = r["JIDNI_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNI_Number"]),

                JIDNI_PRS_Number = r["JIDNI_PRS_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNI_PRS_Number"]),

                JIDNI_Item_Number = r["JIDNI_Item_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNI_Item_Number"]),

                JIDNI_WH_Number = r["JIDNI_WH_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNI_WH_Number"]),

                JIDNI_UoM_Number = r["JIDNI_UoM_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNI_UoM_Number"]),

                JIDNI_Qty = r["JIDNI_Qty"] == DBNull.Value
                    ? 0
                    : Convert.ToDecimal(r["JIDNI_Qty"]),

                JIDNI_UnitPrice = r["JIDNI_UnitPrice"] == DBNull.Value
                    ? 0
                    : Convert.ToDecimal(r["JIDNI_UnitPrice"]),

                JIDNI_Amount = r["JIDNI_Amount"] == DBNull.Value
                    ? 0
                    : Convert.ToDecimal(r["JIDNI_Amount"]),

                JIDNI_JW_InvoiceTracking = r["JIDNI_JW_InvoiceTracking"] == DBNull.Value
                    ? ""
                    : r["JIDNI_JW_InvoiceTracking"].ToString(),

                JIDNH_Number = r["JIDNH_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNH_Number"]),

                JIDNH_DN_No = r["JIDNH_DN_No"] == DBNull.Value
                    ? ""
                    : r["JIDNH_DN_No"].ToString(),

                JIDNH_DN_Date = r["JIDNH_DN_Date"] == DBNull.Value
                    ? ""
                    : Convert.ToDateTime(r["JIDNH_DN_Date"]).ToString("dd MMM yyyy"),

                JIDNH_MS_Number = r["JIDNH_MS_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNH_MS_Number"]),

                JIDNH_JW_Customer_Number = r["JIDNH_JW_Customer_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNH_JW_Customer_Number"]),

                JIDNH_Currency_Number = r["JIDNH_Currency_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNH_Currency_Number"]),

                JIDNH_WH_Number = r["JIDNH_WH_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIDNH_WH_Number"]),

                JIDNH_PaymentTerms = r["JIDNH_PaymentTerms"] == DBNull.Value
                    ? ""
                    : r["JIDNH_PaymentTerms"].ToString(),

                JIDNH_DeliveryTerms = r["JIDNH_DeliveryTerms"] == DBNull.Value
                    ? ""
                    : r["JIDNH_DeliveryTerms"].ToString(),

                JIDNH_DeliveryMode = r["JIDNH_DeliveryMode"] == DBNull.Value
                    ? ""
                    : r["JIDNH_DeliveryMode"].ToString(),

                JIDNH_DespatchDocumentNo = r["JIDNH_DespatchDocumentNo"] == DBNull.Value
                    ? ""
                    : r["JIDNH_DespatchDocumentNo"].ToString(),

                JIDNH_DespatchedThrough = r["JIDNH_DespatchedThrough"] == DBNull.Value
                    ? ""
                    : r["JIDNH_DespatchedThrough"].ToString(),

                JIDNH_Remarks = r["JIDNH_Remarks"] == DBNull.Value
                    ? ""
                    : r["JIDNH_Remarks"].ToString(),
                PRS_ProcessName = r["PRS_ProcessName"] == DBNull.Value
                    ? ""
                    : r["PRS_ProcessName"].ToString(),
                ItemDescription = r["ItemDescription"] == DBNull.Value
                    ? ""
                    : r["ItemDescription"].ToString(),
                OuterDia = r["OuterDia"] == DBNull.Value
                    ? ""
                    : r["OuterDia"].ToString(),
                Thickness = r["Thickness"] == DBNull.Value
                    ? ""
                    : r["Thickness"].ToString(),
                Length = r["Length"] == DBNull.Value
                    ? ""
                    : r["Length"].ToString(),
                ITM_Width = r["ITM_Width"] == DBNull.Value
                    ? ""
                    : r["ITM_Width"].ToString(),
                MaterialGrade = r["MaterialGrade"] == DBNull.Value
                    ? ""
                    : r["MaterialGrade"].ToString(),
                ItemGroup = r["ItemGroup"] == DBNull.Value
                    ? ""
                    : r["ItemGroup"].ToString(),
                UOM = r["UOM"] == DBNull.Value
                    ? ""
                    : r["UOM"].ToString(),
                ItemCode = r["ItemCode"] == DBNull.Value
                    ? ""
                    : r["ItemCode"].ToString(),
                SAC_Number = r["SAC_Number"] == DBNull.Value
                    ? ""
                    : r["ItemCode"].ToString(),
                SAC = r["SAC"] == DBNull.Value
                    ? ""
                    : r["SAC"].ToString()

            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion

        #region GET DELIVERY NOTE GROUP ITEMS

        [HttpGet]

        public JsonResult GetDeliveryNote_GroupItem(long CustomerNumber, long MSNumber, long? JIJWIH_Number = null)
        {
            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();
            // CHANGED: pass JIJWIH_Number through so the SP can add back
            // this invoice's own already-consumed qty when editing
            DataTable dt = dao.GetDeliveryNote_GroupItem(CustomerNumber, MSNumber, JIJWIH_Number).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                TotalQty = r["RemainingQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["RemainingQty"]),
                JIDNH_Number = r["JIDNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_Number"]),
                JIDNH_DN_No = r["JIDNH_DN_No"] == DBNull.Value ? "" : r["JIDNH_DN_No"].ToString(),
                JIDNH_DN_Date = r["JIDNH_DN_Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["JIDNH_DN_Date"]).ToString("dd MMM yyyy")
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, WriteIndented = true });
        }

        #endregion

        #region get default selected address
        #region GET JWC ADDRESS

        [HttpGet]
        public JsonResult GetJWCAddress(long JWCNumber)
        {
            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();

            DataTable dt = dao.GetJWCAddressDB(JWCNumber).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                JWC_ADD_Number = r["JWC_ADD_Number"] == DBNull.Value
        ? 0
        : Convert.ToInt64(r["JWC_ADD_Number"]),

                JWC_ADD_JWC_Number = r["JWC_ADD_JWC_Number"] == DBNull.Value
        ? 0
        : Convert.ToInt64(r["JWC_ADD_JWC_Number"]),

                JWC_ADD_ADTP_Number = r["JWC_ADD_ADTP_Number"] == DBNull.Value
        ? 0
        : Convert.ToInt64(r["JWC_ADD_ADTP_Number"]),

                JWC_ADD_Address_ID = r["JWC_ADD_Address_ID"] == DBNull.Value
        ? ""
        : r["JWC_ADD_Address_ID"].ToString(),

                JWC_ADD_Address = r["JWC_ADD_Address"] == DBNull.Value
        ? ""
        : r["JWC_ADD_Address"].ToString(),

                JWC_ADD_City = r["JWC_ADD_City"] == DBNull.Value
        ? ""
        : r["JWC_ADD_City"].ToString(),

                JWC_ADD_State = r["JWC_ADD_State"] == DBNull.Value
        ? ""
        : r["JWC_ADD_State"].ToString(),

                JWC_ADD_Country = r["JWC_ADD_Country"] == DBNull.Value
        ? ""
        : r["JWC_ADD_Country"].ToString(),

                JWC_ADD_PIN = r["JWC_ADD_PIN"] == DBNull.Value
        ? ""
        : r["JWC_ADD_PIN"].ToString(),

                JWC_ADD_GSTIN = r["JWC_ADD_GSTIN"] == DBNull.Value
        ? ""
        : r["JWC_ADD_GSTIN"].ToString(),

                JWC_ADD_Default = r["JWC_ADD_Default"] == DBNull.Value
        ? 0
        : Convert.ToInt32(r["JWC_ADD_Default"])
            }).ToList();
            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion
        #region GET JOBWORK INVOICE ADDRESS

        [HttpGet]
        public JsonResult GetJobWorkInvoiceAddress(long JIJWIHNumber)
        {
            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();

            DataTable dt = dao.GetJobWorkInvoiceAddressDB(JIJWIHNumber).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                JIJWIA_Number = r["JIJWIA_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIJWIA_Number"]),

                JIJWIA_JIJWIH_Number = r["JIJWIA_JIJWIH_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIJWIA_JIJWIH_Number"]),

                JIJWIA_ADTP_Number = r["JIJWIA_ADTP_Number"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(r["JIJWIA_ADTP_Number"]),

                JIJWIA_Address_ID = r["JIJWIA_Address_ID"] == DBNull.Value
                    ? ""
                    : r["JIJWIA_Address_ID"].ToString(),

                JIJWIA_Address = r["JIJWIA_Address"] == DBNull.Value
                    ? ""
                    : r["JIJWIA_Address"].ToString(),

                JIJWIA_City = r["JIJWIA_City"] == DBNull.Value
                    ? ""
                    : r["JIJWIA_City"].ToString(),

                JIJWIA_State = r["JIJWIA_State"] == DBNull.Value
                    ? ""
                    : r["JIJWIA_State"].ToString(),

                JIJWIA_Country = r["JIJWIA_Country"] == DBNull.Value
                    ? ""
                    : r["JIJWIA_Country"].ToString(),

                JIJWIA_PIN = r["JIJWIA_PIN"] == DBNull.Value
                    ? ""
                    : r["JIJWIA_PIN"].ToString(),

                JIJWIA_GSTIN = r["JIJWIA_GSTIN"] == DBNull.Value
                    ? ""
                    : r["JIJWIA_GSTIN"].ToString()
            }).ToList();
            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion
        #endregion

        #region Header Save
        #region save jobwork invoice

        [HttpPost]
        public IActionResult SaveJobWorkInvoice(
       [FromBody] JobWorkInvoiceCreate_DTO dto)
        {
            try
            {
                Console.Write(dto);

                JobWorkInvoice_DAO DAO = new JobWorkInvoice_DAO();

                DAO.JobWorkInvoiceInsertDB(dto);
                On_JI_NumberGen(Convert.ToInt32(Convert.ToDateTime(dto.Header.JIJWIH_InvoiceDate).ToString("yyyyMMdd")));
                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action(
             "JWInvoiceSummary",
             "JobWorkInvoice")
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        #endregion
        #endregion

        #region GET DELIVERY NOTE FOR INVOICE

        // Get delivery note items using customer number and selected DN numbers
        [HttpGet]
        public JsonResult GetDeliveryNote_ForInvoice(long CustomerNumber, string DNNumbers)
        {
            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();

            DataTable dt = dao.GetDeliveryNote_ForInvoice(CustomerNumber, DNNumbers).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                // ITEM

                JIDNI_JIDNH_Number = r["JIDNI_JIDNH_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNI_JIDNH_Number"]),

                JIDNI_Number = r["JIDNI_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNI_Number"]),

                JIDNI_PRS_Number = r["JIDNI_PRS_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNI_PRS_Number"]),

                PRS_ProcessName = r["PRS_ProcessName"] == DBNull.Value
               ? ""
               : r["PRS_ProcessName"].ToString(),

                JIDNI_Item_Number = r["JIDNI_Item_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNI_Item_Number"]),

                JIDNI_WH_Number = r["JIDNI_WH_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNI_WH_Number"]),

                JIDNI_UoM_Number = r["JIDNI_UoM_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNI_UoM_Number"]),

                JIDNI_Qty = r["JIDNI_Qty"] == DBNull.Value
               ? 0
               : Convert.ToDecimal(r["JIDNI_Qty"]),

                JIDNI_UnitPrice = r["JIDNI_UnitPrice"] == DBNull.Value
               ? 0
               : Convert.ToDecimal(r["JIDNI_UnitPrice"]),

                JIDNI_Amount = r["JIDNI_Amount"] == DBNull.Value
               ? 0
               : Convert.ToDecimal(r["JIDNI_Amount"]),
                JIDNI_JW_InvoiceTracking = r["JIDNI_IsJW_InvoiceApplicable"] == DBNull.Value
               ? ""
               : r["JIDNI_IsJW_InvoiceApplicable"].ToString(),

                // HEAD

                JIDNH_Number = r["JIDNH_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNH_Number"]),

                JIDNH_DN_No = r["JIDNH_DN_No"] == DBNull.Value
               ? ""
               : r["JIDNH_DN_No"].ToString(),

                JIDNH_DN_Date = r["JIDNH_DN_Date"] == DBNull.Value
               ? ""
               : Convert.ToDateTime(r["JIDNH_DN_Date"]).ToString("dd MMM yyyy"),

                JIDNH_MS_Number = r["JIDNH_MS_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNH_MS_Number"]),
                JISVOH_Number = r["JIDNI_JIJWI_SVOH_Number"] == DBNull.Value
           ? 0
           : Convert.ToInt64(r["JIDNI_JIJWI_SVOH_Number"]),

                // NEW: SO Item ID — was missing, needed so it can be preserved
                // through Create → Edit and used in the qty double-count
                // prevention formula
                JISVOI_Number = r["JISVOI_Number"] == DBNull.Value
           ? 0
           : Convert.ToInt64(r["JISVOI_Number"]),

                JISVOI_UnitPrice = r["JISVOI_UnitPrice"] == DBNull.Value
           ? 0
           : Convert.ToInt64(r["JISVOI_UnitPrice"]),

                JIDNH_JW_Customer_Number = r["JIDNH_JW_Customer_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNH_JW_Customer_Number"]),

                JIDNH_Currency_Number = r["JIDNH_Currency_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNH_Currency_Number"]),

                JIDNH_WH_Number = r["JIDNH_WH_Number"] == DBNull.Value
               ? 0
               : Convert.ToInt64(r["JIDNH_WH_Number"]),

                JIDNH_PaymentTerms = r["JIDNH_PaymentTerms"] == DBNull.Value
               ? ""
               : r["JIDNH_PaymentTerms"].ToString(),

                JIDNH_DeliveryTerms = r["JIDNH_DeliveryTerms"] == DBNull.Value
               ? ""
               : r["JIDNH_DeliveryTerms"].ToString(),

                JIDNH_DeliveryMode = r["JIDNH_DeliveryMode"] == DBNull.Value
               ? ""
               : r["JIDNH_DeliveryMode"].ToString(),

                JIDNH_DespatchDocumentNo = r["JIDNH_DespatchDocumentNo"] == DBNull.Value
               ? ""
               : r["JIDNH_DespatchDocumentNo"].ToString(),

                JIDNH_DespatchedThrough = r["JIDNH_DespatchedThrough"] == DBNull.Value
               ? ""
               : r["JIDNH_DespatchedThrough"].ToString(),

                JIDNH_Remarks = r["JIDNH_Remarks"] == DBNull.Value
               ? ""
               : r["JIDNH_Remarks"].ToString(),

                // ITEM MASTER

                ItemDescription = r["ItemDescription"] == DBNull.Value
               ? ""
               : r["ItemDescription"].ToString(),

                OuterDia = r["OuterDia"] == DBNull.Value
               ? ""
               : r["OuterDia"].ToString(),

                Thickness = r["Thickness"] == DBNull.Value
               ? ""
               : r["Thickness"].ToString(),

                Length = r["Length"] == DBNull.Value
               ? ""
               : r["Length"].ToString(),

                ITM_Width = r["ITM_Width"] == DBNull.Value
               ? ""
               : r["ITM_Width"].ToString(),

                MaterialGrade = r["MaterialGrade"] == DBNull.Value
               ? ""
               : r["MaterialGrade"].ToString(),

                // GROUP / UOM

                ItemGroup = r["ItemGroup"] == DBNull.Value
               ? ""
               : r["ItemGroup"].ToString(),

                UOM = r["UOM"] == DBNull.Value
               ? ""
               : r["UOM"].ToString(),

                // ITEM CODE

                ItemCode = r["ItemCode"] == DBNull.Value
               ? ""
               : r["ItemCode"].ToString(),
                SAC_Number = r["SAC_Number"] == DBNull.Value
                    ? ""
                    : r["SAC_Number"].ToString(),
                SAC = r["SAC"] == DBNull.Value
                    ? ""
                    : r["SAC"].ToString(),
                //invoiced qty
                JIJWII_Number = 0,
                InvoicedQty = r["InvoicedQty"] == DBNull.Value
      ? ""
      : r["InvoicedQty"].ToString(),
                HasServiceOrder = r["HasServiceOrder"] == DBNull.Value
    ? 0
    : Convert.ToInt32(r["HasServiceOrder"]),

                ServiceOrderId = r["ServiceOrderId"] == DBNull.Value
    ? 0
    : Convert.ToInt64(r["ServiceOrderId"]),

                ServiceOrderNo = r["ServiceOrderNo"] == DBNull.Value
    ? ""
    : r["ServiceOrderNo"].ToString()



            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion

        #region GET JWC GST ACTIVE

        // Get GST details based on customer and selected date
        [HttpGet]
        public JsonResult Get_JW_Invoice_Taxcluster(long JWC_Number, DateTime CheckDate)
        {
            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();

            DataTable dt = dao.Get_JW_Invoice_Taxcluster(JWC_Number, CheckDate).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                // GST HEADER INFO

                JWC_GST_Number = r["JWC_GST_Number"] == DBNull.Value
                ? 0
                : Convert.ToInt64(r["JWC_GST_Number"]),

                JWC_GST_JWC_Number = r["JWC_GST_JWC_Number"] == DBNull.Value
                ? 0
                : Convert.ToInt64(r["JWC_GST_JWC_Number"]),

                JWC_GST_GSTC_Number = r["JWC_GST_GSTC_Number"] == DBNull.Value
                ? 0
                : Convert.ToInt64(r["JWC_GST_GSTC_Number"]),

                JWC_GST_GSTT_Number = r["JWC_GST_GSTT_Number"] == DBNull.Value
                ? 0
                : Convert.ToInt64(r["JWC_GST_GSTT_Number"]),

                JWC_GST_TCT_Number = r["JWC_GST_TCT_Number"] == DBNull.Value
                ? 0
                : Convert.ToInt64(r["JWC_GST_TCT_Number"]),

                JWC_GST_Description = r["JWC_GST_Description"] == DBNull.Value
                ? ""
                : r["JWC_GST_Description"].ToString(),

                CUS_GST_TCT_Name = r["CUS_GST_TCT_Name"] == DBNull.Value
                ? ""
                : r["CUS_GST_TCT_Name"].ToString(),

                CUS_GST_GSTC_Name = r["CUS_GST_GSTC_Name"] == DBNull.Value
                ? ""
                : r["CUS_GST_GSTC_Name"].ToString(),

                JWC_GST_FromDate = r["JWC_GST_FromDate"] == DBNull.Value
                ? ""
                : r["JWC_GST_FromDate"].ToString(),

                CUS_GST_ToDate = r["CUS_GST_ToDate"] == DBNull.Value
                ? ""
                : r["CUS_GST_ToDate"].ToString()

            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion


        [HttpGet]
        [Route("gst/view")]
        public JsonResult JobInvoiceInvoiceGstView(String? Cluster, String? SIHDate, String? SAC, String? BaseAmount)
        {
            Int64 nUserCode = Convert.ToInt64(UserCode);
            int nJI_InvoiceDate = Convert.ToInt32(Convert.ToDateTime(SIHDate).ToString("yyyyMMdd"));
            Int64 nJI_TCT_Number = Convert.ToInt64(Cluster);
            Int64 nJI_SAC_Number = Convert.ToInt64(SAC);
            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();

            DataTable dt = dao.GetTaxClusterCalculation(nJI_TCT_Number, nJI_SAC_Number, nJI_InvoiceDate).Tables[0]; Double BaseValue = Convert.ToDouble(BaseAmount);

            List<JobInwardInvoiceGst> PurGST = new List<JobInwardInvoiceGst>();

            var GroupTotals = new Dictionary<Int64, Double>();
            var TaxIndex = JW_Inv_DL.SaleInvGstView(dt).GroupBy(gst => gst.TaxIndex);

            foreach (var Group in TaxIndex)
            {
                Double GroupTotal = 0;
                Double GroupAssessableValue = 0;

                var calculationOneItems = Group.Where(TE => TE.Calculation == 1).ToList();
                if (calculationOneItems.Any())
                {
                    var TaxElement = calculationOneItems.First().TaxElement;

                    foreach (var item in Group)
                    {
                        Double ItemTotal = 0;
                        Double ItemValue = 0;
                        Double BaseElementValue = 0;

                        if (Convert.ToInt32(item.Chargeable) == 4 && item.Calculation == 1)
                        {
                            if (item.Percentage.HasValue)
                            {
                                ItemValue += BaseValue;
                                ItemTotal = (BaseValue * (item.Percentage.Value / 100));
                                GroupTotal += ItemTotal;
                                GroupAssessableValue += BaseValue;
                            }
                        }
                        else if (item.Calculation == 0)
                        {
                            if (!GroupTotals.ContainsKey(Convert.ToInt32(item.TaxElement)))
                            {
                                continue;
                            }

                            BaseElementValue = GroupTotals[Convert.ToInt32(item.TaxElement)];

                            if (item.Percentage.HasValue)
                            {
                                ItemValue += BaseElementValue;
                                ItemTotal = (BaseElementValue * (item.Percentage.Value / 100));
                                GroupTotal += ItemTotal;
                                GroupAssessableValue += BaseElementValue;
                            }
                        }
                    }

                    PurGST.Add(
       new JobInwardInvoiceGst
       {
           TaxIndex = Group.Key,
           GSTCNumber = calculationOneItems.First().GSTCNumber,
           GSTTNumber = calculationOneItems.First().GSTTNumber,
           GSTENumber = calculationOneItems.First().GSTENumber,
           TaxCategory = calculationOneItems.First().TaxCategory.ToString(),
           TaxType = calculationOneItems.First().TaxType.ToString(),
           TaxElement = calculationOneItems.First().TaxElementName.ToString(),
           LoadonInventory = calculationOneItems.First().LoadonInventory == "1" ? "Yes" : "No",
           LoadonInventoryPercent = calculationOneItems.First().LoadonInventoryPercent.ToString(),
           Chargeable = calculationOneItems.First().Chargeable.ToString(),
           Calculation = 1,
           Percentage = Convert.ToDouble(calculationOneItems.First().Percentage),

           AssessableValue = double.IsNaN(GroupAssessableValue)
                               ? 0
                               : GroupAssessableValue,

           Amount = double.IsNaN(GroupTotal)
                       ? 0
                       : GroupTotal
       });
                    GroupTotals[Convert.ToInt64(TaxElement)] = GroupTotal;
                }
            }
            return new JsonResult(PurGST, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });

        }
        [HttpGet]
        [Route("income/gst")]
        public JsonResult JobInvoiceHeaderGst(string? Cluster, string? SIHDate, string? SAC, string? BaseAmount)
        {
            Int64 nJI_TCT_Number = Convert.ToInt64(Cluster);
            Int64 nJI_SAC_Number = Convert.ToInt64(SAC);
            Int32 nJI_InvoiceDate = Convert.ToInt32(
                Convert.ToDateTime(SIHDate).ToString("yyyyMMdd")
            );

            Double BaseValue = Convert.ToDouble(BaseAmount);

            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();

            DataSet DS = dao.GetTaxClusterCalculationSAC(
                nJI_TCT_Number,
                nJI_SAC_Number,
                nJI_InvoiceDate
            );

            var GroupTotals = new Dictionary<Int64, Double>();

            var TaxIndex = JW_Inv_DL.SaleInvGst(DS.Tables[0])
                                    .GroupBy(gst => gst.TaxIndex);

            foreach (var Group in TaxIndex)
            {
                Double GroupTotal = 0;

                var TaxElement = Group
                    .Where(x => x.Calculation == 1)
                    .Select(x => x.TaxElement)
                    .FirstOrDefault();

                foreach (var item in Group)
                {
                    if (Convert.ToInt32(item.Chargeable) == 4 &&
                        item.Calculation == 1)
                    {
                        if (item.Percentage.HasValue)
                        {
                            GroupTotal += BaseValue *
                                          (item.Percentage.Value / 100);
                        }
                    }
                    else if (item.Calculation == 0)
                    {
                        Int64 taxElement = Convert.ToInt64(item.TaxElement);

                        if (GroupTotals.ContainsKey(taxElement))
                        {
                            Double BaseElementValue = GroupTotals[taxElement];

                            if (item.Percentage.HasValue)
                            {
                                GroupTotal += BaseElementValue *
                                              (item.Percentage.Value / 100);
                            }
                        }
                    }
                }

                GroupTotals[Convert.ToInt64(TaxElement)] = GroupTotal;
            }

            Double OverallTotal = GroupTotals.Values.Sum();

            return Json(OverallTotal);
        }

        #region summary
        //Sale Invoice summary
        [Route("JWInvoice/transactions/JWInvoice-summary")]
        public IActionResult JWInvoiceSummary(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            SIR_List = SISummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View("JWInvoiceSummary", PaginatedList_DTO<JobWorkInvoiceSummary_DTO>.CreateAsync(SIR_List, DPageNumber ?? 1, DPageSize));
        }
        [Route("JWInvoice/transactions/JWInvoice-summary")]
        [HttpPost]
        public IActionResult JWInvoiceSummary(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter, String? Mode, String? DeleteNumbers, String? SI_No, String[] DeleteNumber, String selectAllCheckbox)
        {
            //ReceiptNote_DTO SH_DTO = new ReceiptNote_DTO();
            //if (Mode == "Delete")
            //{
            //    SH_DTO.JIRNH_Number = Convert.ToInt64(SI_No);
            //    SH_DTO.JIRN_Id = 104;
            //    SH_DTO.JIRN_CreatorCode = Convert.ToInt32(UserCode);
            //    DS = SI_DAO.JI_ReceiptNoteDB(SH_DTO);
            //    return RedirectToAction("ReciptNoteSummaryDetailed");
            //}
            //if (Mode == "View")
            //{


            //    return RedirectToAction("PreviewReceiptNote", new
            //    {
            //        SI_No = SI_No
            //    });
            //}
            if (Mode == "Edit")
            {


                return RedirectToAction("Edit", new
                {
                    SI_No = SI_No
                });
            }
            SIR_List = SISummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(PaginatedList_DTO<JobWorkInvoiceSummary_DTO>.CreateAsync(SIR_List, DPageNumber ?? 1, DPageSize));
        }


        List<JobWorkInvoiceSummary_DTO> SISummaryGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            DPageSize = 10;

            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();

            DataSet DS = dao.GetJobWorkInvoiceList();
            SIR_List = JW_Inv_DL.JobWorkInvoiceSummaryList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder))
            {
                SortOrder = "Title_desc";
            }
            if (Convert.ToInt32(PageNumber) == 0)
            {
                DPageNumber = 1;
            }
            if (PageFilter?.ToLower() == "PageFilter".ToLower())
            {
                DPageNumber = 1;
            }

            ViewData["CurrentSIrt"] = SortOrder;
            ViewData["KeySIrt"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;

            var Key = SIR_List.OrderByDescending(Cs => Cs.JIJWIH_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                //Key = Key.Where(K => K.SI_InvoiceDate.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_InvoiceNo.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_BUY_Name.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_CUR_Name.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_MS_Name.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_NoOfItem.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_Qty.ToString().ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.SI_Number);

                Key = Key.Where(K => K.JIJWIH_InvoiceDate.ToString().ToLower().Contains(Search.ToLower()) ||
                K.JIJWIH_InvoiceNo.ToString().ToLower().Contains(Search.ToLower()) ||
                K.CUS_Name.ToString().ToLower().Contains(Search.ToLower()) ||
                K.CurrencyCode.ToString().ToLower().Contains(Search.ToLower()) ||
                K.Amount.ToString().ToLower().Contains(Search.ToLower()) ||
                K.TotalQty.ToString().ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.JIJWIH_Number);



            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => Convert.ToDateTime(K.JIJWIH_InvoiceDate)!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => Convert.ToDateTime(K.JIJWIH_InvoiceDate)!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JIJWIH_InvoiceDate);
                    break;
            }

            if (PSize != 0)
            {
                DPageSize = PSize;
            }
            Int32 Record = Key.ToList().Count;
            if (PageNumber > 1)
            {
                Int32 RecordPage = (Convert.ToInt32(PageNumber) - 1) * DPageSize;

                if (Record > RecordPage)
                {
                    if (Convert.ToInt32(PageNumber) == 0)
                    {
                        DPageNumber = 1;
                    }
                    else
                    {
                        DPageNumber = Convert.ToInt32(PageNumber);
                    }
                }
                else
                {
                    Double Page = Convert.ToDouble(Record) / Convert.ToDouble(DPageSize);
                    Int32 PageCount = Convert.ToInt32(Math.Ceiling(Page));
                    if (PageNumber > PageCount)
                    {
                        DPageNumber = Convert.ToInt32(PageCount);
                    }
                    else
                    {
                        DPageNumber = Convert.ToInt32(PageNumber);
                    }
                }
            }
            else
            {
                if (Convert.ToInt32(PageNumber) == 0)
                {
                    DPageNumber = 1;
                }
                else
                {
                    DPageNumber = Convert.ToInt32(PageNumber);
                }
            }

            Double Pages = Convert.ToDouble(Record) / Convert.ToDouble(DPageSize);
            Int32 PageCounts = Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.SumOfQty = Key.Sum(item => double.TryParse(item.TotalQty.ToString(), out double val) ? val : 0);

            ViewBag.SumOfAmount = Key.Sum(item => double.TryParse(item.TotalQty.ToString(), out double val) ? val : 0);

            ViewBag.SumOfHeadGst = Key.Sum(item => double.TryParse(item.GST_Amount.ToString(), out double val) ? val : 0);        //   ViewBag.SumOfReceivable = Key.Sum(item => Convert.ToDouble(item.RN_BuyerReceivable));

            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = DPageNumber;
            ViewData["PageSize"] = DPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.ToList().Count;
            if (DS.Tables.Count > 1 && DS.Tables[1].Rows.Count > 0)
            {
                ViewBag.SumOfQty = DS.Tables[1].Rows[0]["GrandTotalQty"] == DBNull.Value ? 0 : Convert.ToDouble(DS.Tables[1].Rows[0]["GrandTotalQty"]);

                ViewBag.SumOfAmount = DS.Tables[1].Rows[0]["GrandTotalAmount"] == DBNull.Value ? 0 : Convert.ToDouble(DS.Tables[1].Rows[0]["GrandTotalAmount"]);

                ViewBag.SumOfGST = DS.Tables[1].Rows[0]["GrandTotalGST"] == DBNull.Value ? 0 : Convert.ToDouble(DS.Tables[1].Rows[0]["GrandTotalGST"]);
            }
            return Key.ToList();
        }


        #endregion

        #region detailed
        //Sale Invoice summary
        [Route("JWInvoice/transactions/JWInvoice-Detailed")]
        public IActionResult JWInvoiceDetailed(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            SIR_List_detail = DetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View("JWInvoiceDetailed", PaginatedList_DTO<JobWorkInvoiceDetail_DTO>.CreateAsync(SIR_List_detail, DPageNumber ?? 1, DPageSize));
        }
        [Route("JWInvoice/transactions/JWInvoice-JWInvoiceDetailed")]
        [HttpPost]
        public IActionResult JWInvoiceDetailed(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter, String? Mode, String? DeleteNumbers, String? SI_No, String[] DeleteNumber, String selectAllCheckbox)
        {
            //ReceiptNote_DTO SH_DTO = new ReceiptNote_DTO();
            //if (Mode == "Delete")
            //{
            //    SH_DTO.JIRNH_Number = Convert.ToInt64(SI_No);
            //    SH_DTO.JIRN_Id = 104;
            //    SH_DTO.JIRN_CreatorCode = Convert.ToInt32(UserCode);
            //    DS = SI_DAO.JI_ReceiptNoteDB(SH_DTO);
            //    return RedirectToAction("ReciptNoteSummaryDetailed");
            //}
            //if (Mode == "View")
            //{


            //    return RedirectToAction("PreviewReceiptNote", new
            //    {
            //        SI_No = SI_No
            //    });
            //}
            if (Mode == "Edit")
            {


                return RedirectToAction("Edit", new
                {
                    SI_No = SI_No
                });
            }
            SIR_List_detail = DetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(PaginatedList_DTO<JobWorkInvoiceDetail_DTO>.CreateAsync(SIR_List_detail, DPageNumber ?? 1, DPageSize));
        }

        List<JobWorkInvoiceDetail_DTO> DetailedGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            DPageSize = 10;

            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();

            DataSet DS = dao.GetJobWorkInvoiceListDetailed();
            SIR_List_detail = JW_Inv_DL.JobWorkInvoiceDetailList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder))
            {
                SortOrder = "Title_desc";
            }
            if (Convert.ToInt32(PageNumber) == 0)
            {
                DPageNumber = 1;
            }
            if (PageFilter?.ToLower() == "PageFilter".ToLower())
            {
                DPageNumber = 1;
            }

            ViewData["CurrentSIrt"] = SortOrder;
            ViewData["KeySIrt"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;

            var Key = SIR_List_detail.OrderByDescending(Cs => Cs.JIJWIH_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                //Key = Key.Where(K => K.SI_InvoiceDate.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_InvoiceNo.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_BUY_Name.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_CUR_Name.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_MS_Name.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_NoOfItem.ToString().ToLower().Contains(Search.ToLower()) ||
                // K.SI_Qty.ToString().ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.SI_Number);

                Key = Key.Where(K => K.JIJWIH_InvoiceDate.ToString().ToLower().Contains(Search.ToLower()) ||
                K.JIJWIH_InvoiceNo.ToString().ToLower().Contains(Search.ToLower()) ||
                K.CUS_Name.ToString().ToLower().Contains(Search.ToLower()) ||
                K.CurrencyCode.ToString().ToLower().Contains(Search.ToLower()) ||
                K.JIJWII_Amount.ToString().ToLower().Contains(Search.ToLower()) ||
                K.JIJWII_Qty.ToString().ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.JIJWIH_Number);



            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => Convert.ToDateTime(K.JIJWIH_InvoiceDate)!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => Convert.ToDateTime(K.JIJWIH_InvoiceDate)!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JIJWIH_InvoiceDate);
                    break;
            }

            if (PSize != 0)
            {
                DPageSize = PSize;
            }
            Int32 Record = Key.ToList().Count;
            if (PageNumber > 1)
            {
                Int32 RecordPage = (Convert.ToInt32(PageNumber) - 1) * DPageSize;

                if (Record > RecordPage)
                {
                    if (Convert.ToInt32(PageNumber) == 0)
                    {
                        DPageNumber = 1;
                    }
                    else
                    {
                        DPageNumber = Convert.ToInt32(PageNumber);
                    }
                }
                else
                {
                    Double Page = Convert.ToDouble(Record) / Convert.ToDouble(DPageSize);
                    Int32 PageCount = Convert.ToInt32(Math.Ceiling(Page));
                    if (PageNumber > PageCount)
                    {
                        DPageNumber = Convert.ToInt32(PageCount);
                    }
                    else
                    {
                        DPageNumber = Convert.ToInt32(PageNumber);
                    }
                }
            }
            else
            {
                if (Convert.ToInt32(PageNumber) == 0)
                {
                    DPageNumber = 1;
                }
                else
                {
                    DPageNumber = Convert.ToInt32(PageNumber);
                }
            }

            Double Pages = Convert.ToDouble(Record) / Convert.ToDouble(DPageSize);
            Int32 PageCounts = Convert.ToInt32(Math.Ceiling(Pages));

            //  ViewBag.SumOfItem = Key.Sum(item => Convert.ToDouble(item.RN_NoOfItem));
            ViewBag.SumOfQty = Key.Sum(item => Convert.ToDouble(item.JIJWII_Qty));
            //  ViewBag.SumOfItemIncome = Key.Sum(item => Convert.ToDouble(item.RN_TotalItemIncome));
            //  ViewBag.SumOfHeadIncome = Key.Sum(item => Convert.ToDouble(item.RN_TotalHeadIncome));
            ViewBag.SumOfAmount = Key.Sum(item => Convert.ToDouble(item.JIJWII_Amount));
            ViewBag.SumOfHeadGst = Key.Sum(item => Convert.ToDouble(item.JIJWII_GST_Amount));
            //   ViewBag.SumOfReceivable = Key.Sum(item => Convert.ToDouble(item.RN_BuyerReceivable));

            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = DPageNumber;
            ViewData["PageSize"] = DPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.ToList().Count;
            if (DS.Tables.Count > 1 && DS.Tables[1].Rows.Count > 0)
            {
                ViewBag.SumOfQty =
                    Convert.ToDouble(DS.Tables[1].Rows[0]["TotalQty"]);

                ViewBag.SumOfAmount =
                    Convert.ToDouble(DS.Tables[1].Rows[0]["TotalAmount"]);

                ViewBag.SumOfGST =
                    Convert.ToDouble(DS.Tables[1].Rows[0]["TotalGST"]);
            }
            return Key.ToList();
        }

        #endregion

        #region View
        public ActionResult JWInvoiceView()
        {

            JobWorkInvoiceCreate_DTO obj = new JobWorkInvoiceCreate_DTO();

            return View(obj);
        }
        #endregion
        #region EDIT GET JOBWORK INVOICE JSON

        [HttpGet]
        public JsonResult GetJobWorkInvoice(long JIJWIH_Number)
        {
            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();

            string json = dao.GetJobWorkInvoiceJSON(JIJWIH_Number);

            if (string.IsNullOrEmpty(json))
            {
                return new JsonResult(new
                {
                    Header = new object(),
                    Items = new object[] { },
                    Addresses = new object[] { },
                    GST = new object[] { }
                });
            }

            var obj = JsonSerializer.Deserialize<object>(json);

            return new JsonResult(obj, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion
        #region UPDATE JOBWORK INVOICE
        [HttpPost]
        public IActionResult UpdateJobWorkInvoice(
            [FromBody] JobWorkInvoiceCreate_DTO dto)
        {
            try
            {
                Console.Write(dto);

                JobWorkInvoice_DAO JI_DAO =
                    new JobWorkInvoice_DAO();

                JI_DAO.JobWorkInvoiceUpdateDB(dto);

                // JI_DAO.JobWorkInvoiceItemBulkUpdate(dto);
                //// JI_DAO.JobWorkInvoiceAddressBulkUpdate(dto);

                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action(
                        "JWInvoiceSummary",
                        "JobWorkInvoice")
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
        #endregion

        #region
        [HttpGet]
        public JsonResult GetServiceOrderItemInfo(
long JISVOH_Number,
long PRS_Number,
long Item_Number,
long UoM_Number)
        {
            DataTable dt = new JobWorkInvoice_DAO()
                .GetServiceOrderItemInfo(
                    JISVOH_Number,
                    PRS_Number,
                    Item_Number,
                    UoM_Number).Tables[0];

            if (dt.Rows.Count == 0)
                return Json(null);

            var row = dt.Rows[0];

            return Json(new
            {
                UnitPrice = row["JISVOI_UnitPrice"],
                Amount = row["JISVOI_Amount"],
                JISVOI_Number = row["JISVOI_Number"].ToString(),

            });
        }

        #endregion

        #region GET JIJWI SERVICE ORDER DROPDOWN

        [HttpGet]
        public JsonResult GetJobWorkInvoiceServiceOrder(long customerId, long? prsNumber = null, long? itemNumber = null, long? uomNumber = null)
        {
            var dt = new JobWorkInvoice_DAO()
                .GetJobWorkInvoiceServiceOrderDB(customerId, prsNumber, itemNumber, uomNumber)
                .Tables[0];

            return new JsonResult(
                dt.AsEnumerable().Select(r => new
                {
                    value = r["JIJWI_SVOH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIJWI_SVOH_Number"]),
                    text = r["JIJWI_SVOH_ServiceOrderNo"]?.ToString() ?? "",
                    jisvoiNumber = r["JIJWI_SVOI_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIJWI_SVOI_Number"])
                }).ToList(),
                new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = true
                });
        }

        #endregion
    }
}