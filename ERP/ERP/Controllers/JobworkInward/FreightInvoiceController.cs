using ERP.DataList;
using ERP.Models;
using ERP_DAO;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;
using System.Text.Json;

namespace ERP.Controllers.JobworkInward
{
    public class FreightInvoiceController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();
        FreightInvoice_DAO FRT_Inv_DAO = new FreightInvoice_DAO();
        FreightInvoice_DL FRT_Inv_DL = new FreightInvoice_DL();
        List<FreightInvoiceSummary_DTO> FRT_List = new List<FreightInvoiceSummary_DTO>();
        List<FreightInvoiceDetail_DTO> FRT_List_detail = new List<FreightInvoiceDetail_DTO>();
        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;
        Int32? DPageNumber;
        Int32 DPageSize;

        #region FreightInvoice Edit
        public IActionResult Edit(long FRTIH_Number)
        {
            GetFreightInvoiceData();
            ViewBag.Collapse = true;
            return View();
        }
        #endregion

        public IActionResult Create()
        {
            GetFreightInvoiceData();
            ViewBag.Collapse = true;
            return View();
        }

        #region numbering
        [HttpGet]
        [Route("freightinvoice/transactions/freightinvoice/next-frti-number")]
        public string OnFreightInvoiceNextNumber(DateTime FRTIDate)
        {
            FRTI_NextNumber_DTO DTO = new FRTI_NextNumber_DTO();
            DTO.Id = 101;
            DTO.FRTIDate = FRTIDate;
            DTO.CreatorCode = Convert.ToInt32(0);

            try
            {
                DTO = new FRTI_NextNumber_DAO().FRTINextNumberDB(DTO);
            }
            catch (Exception ex)
            {
                ViewBag.ErrorCode = 2;
                ViewBag.ErrorMessage = "Freight Invoice Number is not configured for the selected Invoice Date.";
                return "";
            }

            return DTO.FinalFRTINumber;
        }
        #endregion

        #region dropdown data
        public void GetFreightInvoiceData()
        {
            // Reuses the same generic-reference SP Jobwork Invoice uses -
            // these dropdowns (Currency, UoM, Warehouse, AddressType,
            // Process, SAC, SON, MaterialSegregation) are not Jobwork-specific.
            JobworkInvoiceCreate_DTO DN_DTO = new JobworkInvoiceCreate_DTO();
            JobworkInvoice_DAO DN_DAO = new JobworkInvoice_DAO();
            DN_DTO.Header.JISVIH_InvoiceDate = DateTime.Now;
            DN_DTO.Header.JW_Inv_Id = 1;

            DataSet DS = new DataSet();
            DS = DN_DAO.JobworkInvoice(DN_DTO);
            ViewBag.Currency = Help.GetCat(DS.Tables[4]);
            ViewBag.UoM = Help.GetCat(DS.Tables[5]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[7]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[11]);
            ViewBag.Process = Help.GetCat(DS.Tables[12]);
            ViewBag.SAC = Help.GetCat(DS.Tables[13]);
            ViewBag.SON = Help.GetCat(DS.Tables[14]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[15]);
        }
        #endregion
        #region GET DELIVERY NOTE ITEMS (Freight-applicable only)

        [HttpGet]
        public JsonResult GetDeliveryNoteItemsFreight(long CustomerNumber)
        {
            DataTable dt = FRT_Inv_DAO.GetDeliveryNoteItemsFreightDB(CustomerNumber).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                JIDNI_JIDNH_Number = r["JIDNI_JIDNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_JIDNH_Number"]),
                JIDNI_Number = r["JIDNI_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_Number"]),
                JIDNI_PRS_Number = r["JIDNI_PRS_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_PRS_Number"]),
                JIDNI_Item_Number = r["JIDNI_Item_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_Item_Number"]),
                JIDNI_WH_Number = r["JIDNI_WH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_WH_Number"]),
                JIDNI_UoM_Number = r["JIDNI_UoM_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_UoM_Number"]),
                JIDNI_Qty = r["JIDNI_Qty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["JIDNI_Qty"]),
                JIDNI_UnitPrice = r["JIDNI_UnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["JIDNI_UnitPrice"]),
                JIDNI_Amount = r["JIDNI_Amount"] == DBNull.Value ? 0 : Convert.ToDecimal(r["JIDNI_Amount"]),
                Freight_Applicable = r["Freight_Applicable"] == DBNull.Value ? "" : r["Freight_Applicable"].ToString(),
                Freight_ServiceOrder_Number = r["Freight_ServiceOrder_Number"] == DBNull.Value ? "" : r["Freight_ServiceOrder_Number"].ToString(),

                // NEW: mirrors Jobwork's hasServiceOrder/serviceOrderNo/jisvoI_UnitPrice
                hasServiceOrder = r["hasServiceOrder"] == DBNull.Value ? 0 : Convert.ToInt32(r["hasServiceOrder"]),
                serviceOrderNo = r["serviceOrderNo"] == DBNull.Value ? "" : r["serviceOrderNo"].ToString(),
                jisvoH_Number = r["jisvoH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["jisvoH_Number"]),
                serviceOrderId = r["serviceOrderId"] == DBNull.Value ? 0 : Convert.ToInt64(r["serviceOrderId"]),
                jisvoI_UnitPrice = r["jisvoI_UnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["jisvoI_UnitPrice"]),

                JIDNH_Number = r["JIDNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_Number"]),

              
                JIDNH_DN_No = r["JIDNH_DN_No"] == DBNull.Value ? "" : r["JIDNH_DN_No"].ToString(),
                JIDNH_DN_Date = r["JIDNH_DN_Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["JIDNH_DN_Date"]).ToString("dd MMM yyyy"),
                JIDNH_MS_Number = r["JIDNH_MS_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_MS_Number"]),
                JIDNH_JW_Customer_Number = r["JIDNH_JW_Customer_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_JW_Customer_Number"]),
                JIDNH_Currency_Number = r["JIDNH_Currency_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_Currency_Number"]),
                JIDNH_WH_Number = r["JIDNH_WH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_WH_Number"]),
                JIDNH_PaymentTerms = r["JIDNH_PaymentTerms"] == DBNull.Value ? "" : r["JIDNH_PaymentTerms"].ToString(),
                JIDNH_DeliveryTerms = r["JIDNH_DeliveryTerms"] == DBNull.Value ? "" : r["JIDNH_DeliveryTerms"].ToString(),
                JIDNH_DeliveryMode = r["JIDNH_DeliveryMode"] == DBNull.Value ? "" : r["JIDNH_DeliveryMode"].ToString(),
                JIDNH_DespatchDocumentNo = r["JIDNH_DespatchDocumentNo"] == DBNull.Value ? "" : r["JIDNH_DespatchDocumentNo"].ToString(),
                JIDNH_DespatchedThrough = r["JIDNH_DespatchedThrough"] == DBNull.Value ? "" : r["JIDNH_DespatchedThrough"].ToString(),
                JIDNH_Remarks = r["JIDNH_Remarks"] == DBNull.Value ? "" : r["JIDNH_Remarks"].ToString(),
                PRS_ProcessName = r["PRS_ProcessName"] == DBNull.Value ? "" : r["PRS_ProcessName"].ToString(),
                ItemDescription = r["ItemDescription"] == DBNull.Value ? "" : r["ItemDescription"].ToString(),
                OuterDia = r["OuterDia"] == DBNull.Value ? "" : r["OuterDia"].ToString(),
                Thickness = r["Thickness"] == DBNull.Value ? "" : r["Thickness"].ToString(),
                Length = r["Length"] == DBNull.Value ? "" : r["Length"].ToString(),
                ITM_Width = r["ITM_Width"] == DBNull.Value ? "" : r["ITM_Width"].ToString(),
                MaterialGrade = r["MaterialGrade"] == DBNull.Value ? "" : r["MaterialGrade"].ToString(),
                ItemGroup = r["ItemGroup"] == DBNull.Value ? "" : r["ItemGroup"].ToString(),
                UOM = r["UOM"] == DBNull.Value ? "" : r["UOM"].ToString(),
                ItemCode = r["ItemCode"] == DBNull.Value ? "" : r["ItemCode"].ToString(),
                SAC_Number = r["SAC_Number"] == DBNull.Value ? "" : r["SAC_Number"].ToString(),
                SAC = r["SAC"] == DBNull.Value ? "" : r["SAC"].ToString()
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion

        #region GET DELIVERY NOTE GROUP ITEMS (Freight-applicable only)

        [HttpGet]
        public JsonResult GetDeliveryNote_GroupItemFreight(long CustomerNumber, long MSNumber)
        {
            DataTable dt = FRT_Inv_DAO.GetDeliveryNote_GroupItem_FreightDB(CustomerNumber, MSNumber).Tables[0];

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

        #region GET DELIVERY NOTE FOR INVOICE (Freight-applicable only)

        [HttpGet]
        public JsonResult GetDeliveryNote_ForFreightInvoice(long CustomerNumber, string DNNumbers)
        {
            DataTable dt = FRT_Inv_DAO.GetDeliveryNote_ForFreightInvoiceDB(CustomerNumber, DNNumbers).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                JIDNI_JIDNH_Number = r["JIDNI_JIDNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_JIDNH_Number"]),
                JIDNI_Number = r["JIDNI_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_Number"]),
                JIDNI_PRS_Number = r["JIDNI_PRS_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_PRS_Number"]),
                PRS_ProcessName = r["PRS_ProcessName"] == DBNull.Value ? "" : r["PRS_ProcessName"].ToString(),
                JIDNI_Item_Number = r["JIDNI_Item_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_Item_Number"]),
                JIDNI_WH_Number = r["JIDNI_WH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_WH_Number"]),
                JIDNI_UoM_Number = r["JIDNI_UoM_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_UoM_Number"]),
                JIDNI_Qty = r["JIDNI_Qty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["JIDNI_Qty"]),
                InvoicedQty = r["InvoicedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["InvoicedQty"]),
                JIDNI_UnitPrice = r["JIDNI_UnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["JIDNI_UnitPrice"]),
                JIDNI_Amount = r["JIDNI_Amount"] == DBNull.Value ? 0 : Convert.ToDecimal(r["JIDNI_Amount"]),
                Freight_Applicable = r["Freight_Applicable"] == DBNull.Value ? "" : r["Freight_Applicable"].ToString(),
                Freight_ServiceOrder_Number = r["Freight_ServiceOrder_Number"] == DBNull.Value ? "" : r["Freight_ServiceOrder_Number"].ToString(),

                // NEW: mirrors Jobwork's hasServiceOrder/serviceOrderNo/jisvoI_UnitPrice
                hasServiceOrder = r["hasServiceOrder"] == DBNull.Value ? 0 : Convert.ToInt32(r["hasServiceOrder"]),
                serviceOrderNo = r["serviceOrderNo"] == DBNull.Value ? "" : r["serviceOrderNo"].ToString(),
                jisvoH_Number = r["jisvoH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["jisvoH_Number"]),
                serviceOrderId = r["serviceOrderId"] == DBNull.Value ? 0 : Convert.ToInt64(r["serviceOrderId"]),
                jisvoI_UnitPrice = r["jisvoI_UnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["jisvoI_UnitPrice"]),
                JISVOI_Number = r["JISVOI_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JISVOI_Number"]), // NEW: SO Item ID,

                JIDNH_Number = r["JIDNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_Number"]),
                JIDNH_DN_No = r["JIDNH_DN_No"] == DBNull.Value ? "" : r["JIDNH_DN_No"].ToString(),
                JIDNH_DN_Date = r["JIDNH_DN_Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["JIDNH_DN_Date"]).ToString("dd MMM yyyy"),
                JIDNH_MS_Number = r["JIDNH_MS_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_MS_Number"]),
                JIDNH_JW_Customer_Number = r["JIDNH_JW_Customer_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_JW_Customer_Number"]),
                JIDNH_Currency_Number = r["JIDNH_Currency_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_Currency_Number"]),
                JIDNH_WH_Number = r["JIDNH_WH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_WH_Number"]),
                JIDNH_PaymentTerms = r["JIDNH_PaymentTerms"] == DBNull.Value ? "" : r["JIDNH_PaymentTerms"].ToString(),
                JIDNH_DeliveryTerms = r["JIDNH_DeliveryTerms"] == DBNull.Value ? "" : r["JIDNH_DeliveryTerms"].ToString(),
                JIDNH_DeliveryMode = r["JIDNH_DeliveryMode"] == DBNull.Value ? "" : r["JIDNH_DeliveryMode"].ToString(),
                JIDNH_DespatchDocumentNo = r["JIDNH_DespatchDocumentNo"] == DBNull.Value ? "" : r["JIDNH_DespatchDocumentNo"].ToString(),
                JIDNH_DespatchedThrough = r["JIDNH_DespatchedThrough"] == DBNull.Value ? "" : r["JIDNH_DespatchedThrough"].ToString(),
                JIDNH_Remarks = r["JIDNH_Remarks"] == DBNull.Value ? "" : r["JIDNH_Remarks"].ToString(),
                ItemDescription = r["ItemDescription"] == DBNull.Value ? "" : r["ItemDescription"].ToString(),
                OuterDia = r["OuterDia"] == DBNull.Value ? "" : r["OuterDia"].ToString(),
                Thickness = r["Thickness"] == DBNull.Value ? "" : r["Thickness"].ToString(),
                Length = r["Length"] == DBNull.Value ? "" : r["Length"].ToString(),
                ITM_Width = r["ITM_Width"] == DBNull.Value ? "" : r["ITM_Width"].ToString(),
                MaterialGrade = r["MaterialGrade"] == DBNull.Value ? "" : r["MaterialGrade"].ToString(),
                ItemGroup = r["ItemGroup"] == DBNull.Value ? "" : r["ItemGroup"].ToString(),
                UOM = r["UOM"] == DBNull.Value ? "" : r["UOM"].ToString(),
                ItemCode = r["ItemCode"] == DBNull.Value ? "" : r["ItemCode"].ToString(),
                SAC_Number = r["SAC_Number"] == DBNull.Value ? "" : r["SAC_Number"].ToString(),
                SAC = r["SAC"] == DBNull.Value ? "" : r["SAC"].ToString()
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion

        #region GET RECEIPT NOTE GROUP ITEMS (Freight-applicable only)

        [HttpGet]
        public JsonResult GetReceiptNote_GroupItemFreight(long CustomerNumber, long MSNumber)
        {
            DataTable dt = FRT_Inv_DAO.GetReceiptNote_GroupItem_FreightDB(CustomerNumber, MSNumber).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                TotalQty = r["RemainingQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["RemainingQty"]),
                JIRNH_Number = r["JIRNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNH_Number"]),
                JIRNH_RN_No = r["JIRNH_RN_No"] == DBNull.Value ? "" : r["JIRNH_RN_No"].ToString(),
                JIRNH_RN_Date = r["JIRNH_RN_Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["JIRNH_RN_Date"]).ToString("dd MMM yyyy")
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, WriteIndented = true });
        }

        #endregion

        #region GET RECEIPT NOTE FOR INVOICE (Freight-applicable only)

        [HttpGet]
        public JsonResult GetReceiptNote_ForFreightInvoice(long CustomerNumber, string RNNumbers)
        {
            DataTable dt = FRT_Inv_DAO.GetReceiptNote_ForFreightInvoiceDB(CustomerNumber, RNNumbers).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                JIRNI_JIRNH_Number = r["JIRNI_JIRNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNI_JIRNH_Number"]),
                JIRNI_Number = r["JIRNI_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNI_Number"]),
                JIRNI_PRS_Number = r["JIRNI_PRS_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNI_PRS_Number"]),
                PRS_ProcessName = r["PRS_ProcessName"] == DBNull.Value ? "" : r["PRS_ProcessName"].ToString(),
                JIRNI_Item_Number = r["JIRNI_Item_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNI_Item_Number"]),
                JIRNI_WH_Number = r["JIRNI_WH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNI_WH_Number"]),
                JIRNI_UoM_Number = r["JIRNI_UoM_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNI_UoM_Number"]),
                JIRNI_Qty = r["JIRNI_Qty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["JIRNI_Qty"]),
                InvoicedQty = r["InvoicedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["InvoicedQty"]),
                JIRNI_UnitPrice = r["JIRNI_UnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["JIRNI_UnitPrice"]),
                JIRNI_Amount = r["JIRNI_Amount"] == DBNull.Value ? 0 : Convert.ToDecimal(r["JIRNI_Amount"]),
                JIRNI_Freight_Applicable = r["JIRNI_Freight_Applicable"] == DBNull.Value ? "" : r["JIRNI_Freight_Applicable"].ToString(),
                JIRNI_Freight_ServiceOrder_Number = r["JIRNI_Freight_ServiceOrder_Number"] == DBNull.Value ? "" : r["JIRNI_Freight_ServiceOrder_Number"].ToString(),

                hasServiceOrder = r["hasServiceOrder"] == DBNull.Value ? 0 : Convert.ToInt32(r["hasServiceOrder"]),
                serviceOrderNo = r["serviceOrderNo"] == DBNull.Value ? "" : r["serviceOrderNo"].ToString(),
                jisvoH_Number = r["jisvoH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["jisvoH_Number"]),
                serviceOrderId = r["serviceOrderId"] == DBNull.Value ? 0 : Convert.ToInt64(r["serviceOrderId"]),
                jisvoI_UnitPrice = r["jisvoI_UnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["jisvoI_UnitPrice"]),
                JISVOI_Number = r["JISVOI_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JISVOI_Number"]),

                JIRNH_Number = r["JIRNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNH_Number"]),
                JIRNH_RN_No = r["JIRNH_RN_No"] == DBNull.Value ? "" : r["JIRNH_RN_No"].ToString(),
                JIRNH_RN_Date = r["JIRNH_RN_Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["JIRNH_RN_Date"]).ToString("dd MMM yyyy"),
                JIRNH_MS_Number = r["JIRNH_MS_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNH_MS_Number"]),
                JIRNH_JWC_Number = r["JIRNH_JWC_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNH_JWC_Number"]),
                JIRNH_Currency_Number = r["JIRNH_Currency_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNH_Currency_Number"]),
                JIRNH_WH_Number = r["JIRNH_WH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIRNH_WH_Number"]),
                JIRNH_Remarks = r["JIRNH_Remarks"] == DBNull.Value ? "" : r["JIRNH_Remarks"].ToString(),
                ItemDescription = r["ItemDescription"] == DBNull.Value ? "" : r["ItemDescription"].ToString(),
                OuterDia = r["OuterDia"] == DBNull.Value ? "" : r["OuterDia"].ToString(),
                Thickness = r["Thickness"] == DBNull.Value ? "" : r["Thickness"].ToString(),
                Length = r["Length"] == DBNull.Value ? "" : r["Length"].ToString(),
                ITM_Width = r["ITM_Width"] == DBNull.Value ? "" : r["ITM_Width"].ToString(),
                MaterialGrade = r["MaterialGrade"] == DBNull.Value ? "" : r["MaterialGrade"].ToString(),
                ItemGroup = r["ItemGroup"] == DBNull.Value ? "" : r["ItemGroup"].ToString(),
                UOM = r["UOM"] == DBNull.Value ? "" : r["UOM"].ToString(),
                ItemCode = r["ItemCode"] == DBNull.Value ? "" : r["ItemCode"].ToString(),
                SAC_Number = r["SAC_Number"] == DBNull.Value ? "" : r["SAC_Number"].ToString(),
                SAC = r["SAC"] == DBNull.Value ? "" : r["SAC"].ToString()
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion

        #region GET JWC ADDRESS (reused as-is, no Freight-specific version needed)

        [HttpGet]
        public JsonResult GetJWCAddress(long JWCNumber)
        {
            JobworkInvoice_DAO dao = new JobworkInvoice_DAO();
            DataTable dt = dao.GetJWCAddressDB(JWCNumber).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                JWC_ADD_Number = r["JWC_ADD_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JWC_ADD_Number"]),
                JWC_ADD_JWC_Number = r["JWC_ADD_JWC_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JWC_ADD_JWC_Number"]),
                JWC_ADD_ADTP_Number = r["JWC_ADD_ADTP_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JWC_ADD_ADTP_Number"]),
                JWC_ADD_Address_ID = r["JWC_ADD_Address_ID"] == DBNull.Value ? "" : r["JWC_ADD_Address_ID"].ToString(),
                JWC_ADD_Address = r["JWC_ADD_Address"] == DBNull.Value ? "" : r["JWC_ADD_Address"].ToString(),
                JWC_ADD_City = r["JWC_ADD_City"] == DBNull.Value ? "" : r["JWC_ADD_City"].ToString(),
                JWC_ADD_State = r["JWC_ADD_State"] == DBNull.Value ? "" : r["JWC_ADD_State"].ToString(),
                JWC_ADD_Country = r["JWC_ADD_Country"] == DBNull.Value ? "" : r["JWC_ADD_Country"].ToString(),
                JWC_ADD_PIN = r["JWC_ADD_PIN"] == DBNull.Value ? "" : r["JWC_ADD_PIN"].ToString(),
                JWC_ADD_GSTIN = r["JWC_ADD_GSTIN"] == DBNull.Value ? "" : r["JWC_ADD_GSTIN"].ToString()
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion

        #region GET FREIGHT INVOICE ADDRESS

        [HttpGet]
        public JsonResult GetFreightInvoiceAddress(long FRTIH_Number)
        {
            DataTable dt = FRT_Inv_DAO.GetFreightInvoiceAddressDB(FRTIH_Number).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                FRTIA_Number = r["FRTIA_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["FRTIA_Number"]),
                FRTIA_ADTP_Number = r["FRTIA_ADTP_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["FRTIA_ADTP_Number"]),
                FRTIA_Address_ID = r["FRTIA_Address_ID"] == DBNull.Value ? "" : r["FRTIA_Address_ID"].ToString(),
                FRTIA_Address = r["FRTIA_Address"] == DBNull.Value ? "" : r["FRTIA_Address"].ToString(),
                FRTIA_City = r["FRTIA_City"] == DBNull.Value ? "" : r["FRTIA_City"].ToString(),
                FRTIA_State = r["FRTIA_State"] == DBNull.Value ? "" : r["FRTIA_State"].ToString(),
                FRTIA_Country = r["FRTIA_Country"] == DBNull.Value ? "" : r["FRTIA_Country"].ToString(),
                FRTIA_PIN = r["FRTIA_PIN"] == DBNull.Value ? "" : r["FRTIA_PIN"].ToString(),
                FRTIA_GSTIN = r["FRTIA_GSTIN"] == DBNull.Value ? "" : r["FRTIA_GSTIN"].ToString()
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion
        #region Save Freight Invoice

        [HttpPost]
        public IActionResult SaveFreightInvoice(
                 [FromBody] FreightInvoiceCreate_DTO dto)
        {
            try
            {
               
                FreightInvoice_DAO DAO = new FreightInvoice_DAO();

                DAO.FreightInvoiceInsertDB(dto);

                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action(
                        "FreightInvoiceSummary",
                        "FreightInvoice")
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

        #region Update Freight Invoice

        [HttpPost]
        public IActionResult UpdateFreightInvoice(
            [FromBody] FreightInvoiceCreate_DTO dto)
        {
            // NEW: identify exactly which field failed to bind
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(kvp => kvp.Value.Errors.Count > 0)
                    .Select(kvp => new
                    {
                        Field = kvp.Key,
                        Errors = kvp.Value.Errors.Select(e => e.ErrorMessage).ToList()
                    })
                    .ToList();

                 return Json(new { success = false, modelErrors = errors });
            }

            // NEW: pinpoint exactly what's null before it crashes downstream
            if (dto == null)
            {
                return Json(new { success = false, message = "dto itself is null — model binding completely failed" });
            }

            if (dto.Header == null)
            {
                return Json(new { success = false, message = "dto.Header is null" });
            }

            try
            {
                Console.Write(dto);

                FreightInvoice_DAO FRT_DAO =
                    new FreightInvoice_DAO();

                FRT_DAO.FreightInvoiceUpdateDB(dto);

                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action(
                        "FreightInvoiceSummary",
                        "FreightInvoice")
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message,
                    // NEW: full stack trace for precise line-level diagnosis
                    stackTrace = ex.StackTrace
                });
            }
        }

        #endregion

        #region EDIT GET FREIGHT INVOICE JSON

        [HttpGet]
        public JsonResult GetFreightInvoice(long FRTIH_Number)
        {
            FreightInvoice_DAO dao = new FreightInvoice_DAO();

            string json = dao.GetFreightInvoiceJSON(FRTIH_Number);

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

        #region View

        public ActionResult FreightInvoiceView()
        {
            FreightInvoiceCreate_DTO obj = new FreightInvoiceCreate_DTO();
            return View(obj);
        }

        #endregion

        #region summary
        [Route("FreightInvoice/transactions/FreightInvoice-summary")]
        public IActionResult FreightInvoiceSummary(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            FRT_List = FRTSummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View("FreightInvoiceSummary", PaginatedList_DTO<FreightInvoiceSummary_DTO>.CreateAsync(FRT_List, DPageNumber ?? 1, DPageSize));
        }

        [Route("FreightInvoice/transactions/FreightInvoice-summary")]
        [HttpPost]
        public IActionResult FreightInvoiceSummary(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter, String? Mode, String? DeleteNumbers, String? SI_No, String[] DeleteNumber, String selectAllCheckbox)
        {
            if (Mode == "Edit")
            {
                return RedirectToAction("Edit", new
                {
                    SI_No = SI_No
                });
            }
            FRT_List = FRTSummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(PaginatedList_DTO<FreightInvoiceSummary_DTO>.CreateAsync(FRT_List, DPageNumber ?? 1, DPageSize));
        }

        List<FreightInvoiceSummary_DTO> FRTSummaryGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            DPageSize = 10;

            DataSet DS = FRT_Inv_DAO.GetFreightInvoiceList();
            FRT_List = FRT_Inv_DL.FreightInvoiceSummaryList(DS.Tables[0]);

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

            var Key = FRT_List.OrderByDescending(Cs => Cs.FRTIH_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K => K.FRTIH_InvoiceDate.ToString().ToLower().Contains(Search.ToLower()) ||
                K.FRTIH_InvoiceNo.ToString().ToLower().Contains(Search.ToLower()) ||
                K.CUS_Name.ToString().ToLower().Contains(Search.ToLower()) ||
                K.CurrencyCode.ToString().ToLower().Contains(Search.ToLower()) ||
                K.Amount.ToString().ToLower().Contains(Search.ToLower()) ||
                K.TotalQty.ToString().ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.FRTIH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => Convert.ToDateTime(K.FRTIH_InvoiceDate)!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => Convert.ToDateTime(K.FRTIH_InvoiceDate)!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.FRTIH_InvoiceDate);
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
            ViewBag.SumOfHeadGst = Key.Sum(item => double.TryParse(item.GST_Amount.ToString(), out double val) ? val : 0);

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
        [Route("FreightInvoice/transactions/FreightInvoice-Detailed")]
        public IActionResult FreightInvoiceDetailed(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            FRT_List_detail = FRTDetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View("FreightInvoiceDetailed", PaginatedList_DTO<FreightInvoiceDetail_DTO>.CreateAsync(FRT_List_detail, DPageNumber ?? 1, DPageSize));
        }

        [Route("FreightInvoice/transactions/FreightInvoice-FreightInvoiceDetailed")]
        [HttpPost]
        public IActionResult FreightInvoiceDetailed(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter, String? Mode, String? DeleteNumbers, String? SI_No, String[] DeleteNumber, String selectAllCheckbox)
        {
            if (Mode == "Edit")
            {
                return RedirectToAction("Edit", new
                {
                    SI_No = SI_No
                });
            }
            FRT_List_detail = FRTDetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(PaginatedList_DTO<FreightInvoiceDetail_DTO>.CreateAsync(FRT_List_detail, DPageNumber ?? 1, DPageSize));
        }

        List<FreightInvoiceDetail_DTO> FRTDetailedGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            DPageSize = 10;

            DataSet DS = FRT_Inv_DAO.GetFreightInvoiceListDetailed();
            FRT_List_detail = FRT_Inv_DL.FreightInvoiceDetailList(DS.Tables[0]);

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

            var Key = FRT_List_detail.OrderByDescending(Cs => Cs.FRTIH_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K => K.FRTIH_InvoiceDate.ToString().ToLower().Contains(Search.ToLower()) ||
                K.FRTIH_InvoiceNo.ToString().ToLower().Contains(Search.ToLower()) ||
                K.CUS_Name.ToString().ToLower().Contains(Search.ToLower()) ||
                K.CurrencyCode.ToString().ToLower().Contains(Search.ToLower()) ||
                K.FRTII_Amount.ToString().ToLower().Contains(Search.ToLower()) ||
                K.FRTII_Qty.ToString().ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.FRTIH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => Convert.ToDateTime(K.FRTIH_InvoiceDate)!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => Convert.ToDateTime(K.FRTIH_InvoiceDate)!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.FRTIH_InvoiceDate);
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

            ViewBag.SumOfQty = Key.Sum(item => Convert.ToDouble(item.FRTII_Qty));
            ViewBag.SumOfAmount = Key.Sum(item => Convert.ToDouble(item.FRTII_Amount));
            ViewBag.SumOfHeadGst = Key.Sum(item => Convert.ToDouble(item.FRTII_GST_Amount));

            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = DPageNumber;
            ViewData["PageSize"] = DPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.ToList().Count;
            if (DS.Tables.Count > 1 && DS.Tables[1].Rows.Count > 0)
            {
                ViewBag.SumOfQty = Convert.ToDouble(DS.Tables[1].Rows[0]["TotalQty"]);
                ViewBag.SumOfAmount = Convert.ToDouble(DS.Tables[1].Rows[0]["TotalAmount"]);
                ViewBag.SumOfGST = Convert.ToDouble(DS.Tables[1].Rows[0]["TotalGST"]);
            }
            return Key.ToList();
        }

        #endregion

        #region GET TAX CLUSTER

        [HttpGet]
        public IActionResult Get_Freight_Invoice_Taxcluster(long JWC_Number, DateTime CheckDate)
        {
            FreightInvoice_DAO DAO = new FreightInvoice_DAO();
            DataSet DS = DAO.Get_Freight_Invoice_Taxcluster(JWC_Number, CheckDate);

            var data = DS.Tables[0].AsEnumerable().Select(r => new
            {
                JWC_GST_Number = r["JWC_GST_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JWC_GST_Number"]),
                JWC_GST_JWC_Number = r["JWC_GST_JWC_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JWC_GST_JWC_Number"]),
                JWC_GST_GSTC_Number = r["JWC_GST_GSTC_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JWC_GST_GSTC_Number"]),
                JWC_GST_GSTT_Number = r["JWC_GST_GSTT_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JWC_GST_GSTT_Number"]),
                JWC_GST_TCT_Number = r["JWC_GST_TCT_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JWC_GST_TCT_Number"]),
                JWC_GST_Description = r["JWC_GST_Description"] == DBNull.Value ? "" : r["JWC_GST_Description"].ToString(),
                CUS_GST_TCT_Name = r["CUS_GST_TCT_Name"] == DBNull.Value ? "" : r["CUS_GST_TCT_Name"].ToString(),
                CUS_GST_GSTC_Name = r["CUS_GST_GSTC_Name"] == DBNull.Value ? "" : r["CUS_GST_GSTC_Name"].ToString(),
                JWC_GST_FromDate = r["JWC_GST_FromDate"] == DBNull.Value ? "" : r["JWC_GST_FromDate"].ToString(),
                CUS_GST_ToDate = r["CUS_GST_ToDate"] == DBNull.Value ? "" : r["CUS_GST_ToDate"].ToString()
            }).ToList();

            return Json(data);
        }

        #endregion

        #region GET SERVICE ORDER ITEM INFO (reused as-is, generic SO lookup)

        [HttpGet]
        public JsonResult GetServiceOrderItemInfo(
            long Freight_ServiceOrder_Number,
            long PRS_Number,
            long Item_Number,
            long UoM_Number)
        {
            JobworkInvoice_DAO dao = new JobworkInvoice_DAO();

            DataTable dt = dao.GetServiceOrderItemInfo(
                Freight_ServiceOrder_Number,
                PRS_Number,
                Item_Number,
                UoM_Number
            ).Tables[0];

            if (dt.Rows.Count == 0)
            {
                return new JsonResult(null);
            }

            var r = dt.Rows[0];

            var data = new
            {
                jisvoI_Number = r["JISVOI_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JISVOI_Number"]),
                unitPrice = r["JISVOI_UnitPrice"] == DBNull.Value ? (decimal?)null : Convert.ToDecimal(r["JISVOI_UnitPrice"])
            };

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion

    }
}