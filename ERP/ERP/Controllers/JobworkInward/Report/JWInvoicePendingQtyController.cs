using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace ERP.Controllers.JobworkInward.Reports
{
    public class JWInvoicePendingQtyController : Controller
    {
        #region Page

        Help Help = new Help();

        [Route("jobworkinvoice/reports/pending-qty")]
        public IActionResult Index()
        {
            JobWorkInvoice_DAO dao = new JobWorkInvoice_DAO();
            JobWorkInvoiceCreate_DTO dto = new JobWorkInvoiceCreate_DTO();
            dto.Header.JIJWIH_InvoiceDate = DateTime.Now;
            dto.Header.JW_Inv_Id = 1;

            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/Reports/JWInvoicePendingQty/Index.cshtml");
        }

        #endregion

        #region Get Data
        [HttpGet]
        [Route("jobworkinvoice/reports/pending-qty/get")]
        public JsonResult GetJWInvoicePendingQty(
            DateTime? FromDate,
            DateTime? ToDate,
            string DN_No,
            string JW_SO_No,
            long? JW_Customer_Number,
            long? PRS_Number,
            long? ItemGroup_Number,
            long? Item_Number)
        {
            JWInvoicePendingQty_Filter_DTO filter = new JWInvoicePendingQty_Filter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                DN_No = DN_No,
                JW_SO_No = JW_SO_No,
                JW_Customer_Number = JW_Customer_Number,
                PRS_Number = PRS_Number,
                ItemGroup_Number = ItemGroup_Number,
                Item_Number = Item_Number
            };

            JWInvoicePendingQty_DAO dao = new JWInvoicePendingQty_DAO();
            DataTable dt = dao.JWInvoicePendingQtyDB(filter).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                JIDNH_Number = r["JIDNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_Number"]),
                JIDNH_DN_No = r["JIDNH_DN_No"] == DBNull.Value ? "" : r["JIDNH_DN_No"].ToString(),
                JIDNH_DN_Date = r["JIDNH_DN_Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["JIDNH_DN_Date"]).ToString("dd MMM yyyy"),

                JW_SO_Number = r["JW_SO_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JW_SO_Number"]),
                jwSONo = r["JW_SO_No"] == DBNull.Value ? "" : r["JW_SO_No"].ToString(),
                jwSODate = r["JW_SO_Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["JW_SO_Date"]).ToString("dd MMM yyyy"),

                JIDNH_JW_Customer_Number = r["JIDNH_JW_Customer_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_JW_Customer_Number"]),
                jwCustomerName = r["JW_Customer_Name"] == DBNull.Value ? "" : r["JW_Customer_Name"].ToString(),

                JIDNI_PRS_Number = r["JIDNI_PRS_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_PRS_Number"]),
                prsProcessName = r["PRS_ProcessName"] == DBNull.Value ? "" : r["PRS_ProcessName"].ToString(),

                ItemGroupNumber = r["ItemGroupNumber"] == DBNull.Value ? 0 : Convert.ToInt64(r["ItemGroupNumber"]),
                ItemGroupName = r["ItemGroupName"] == DBNull.Value ? "" : r["ItemGroupName"].ToString(),

                itemNumber = r["JIDNI_Item_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_Item_Number"]),
                ItemCode = r["ItemCode"] == DBNull.Value ? "" : r["ItemCode"].ToString(),
                ItemDescription = r["ItemDescription"] == DBNull.Value ? "" : r["ItemDescription"].ToString(),
                OuterDia = r["OuterDia"] == DBNull.Value ? "" : r["OuterDia"].ToString(),
                Thickness = r["Thickness"] == DBNull.Value ? "" : r["Thickness"].ToString(),
                Length = r["Length"] == DBNull.Value ? "" : r["Length"].ToString(),
                MaterialGrade = r["MaterialGrade"] == DBNull.Value ? "" : r["MaterialGrade"].ToString(),

                JIDNI_UoM_Number = r["JIDNI_UoM_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNI_UoM_Number"]),
                UOM = r["UOM"] == DBNull.Value ? "" : r["UOM"].ToString(),

                DeliveredQty = r["DeliveredQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["DeliveredQty"]),
                InvoicedQty = r["InvoicedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["InvoicedQty"]),
                PendingQty = r["PendingQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["PendingQty"])
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion
    }
}