using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace ERP.Controllers.JobworkInward.Reports
{
    public class DNFreightInvoicePendingQtyController : Controller
    {
        #region Page

        [Route("jobworkinvoice/reports/dn-freight-pending-qty")]
        public IActionResult Index()
        {
            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/Reports/DNFreightInvoicePendingQty/Index.cshtml");
        }

        #endregion

        #region Get Data
        [HttpGet]
        [Route("jobworkinvoice/reports/dn-freight-pending-qty/get")]
        public JsonResult GetDNFreightInvoicePendingQty(
            DateTime? FromDate,
            DateTime? ToDate,
            string DN_No,
            string Freight_SO_No,
            long? JW_Customer_Number)
        {
            DNFreightInvoicePendingQty_Filter_DTO filter = new DNFreightInvoicePendingQty_Filter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                DN_No = DN_No,
                Freight_SO_No = Freight_SO_No,
                JW_Customer_Number = JW_Customer_Number
            };

            DNFreightInvoicePendingQty_DAO dao = new DNFreightInvoicePendingQty_DAO();
            DataTable dt = dao.DNFreightInvoicePendingQtyDB(filter).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                dnNumber = r["JIDNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_Number"]),
                dnNo = r["JIDNH_DN_No"] == DBNull.Value ? "" : r["JIDNH_DN_No"].ToString(),
                dnDate = r["JIDNH_DN_Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["JIDNH_DN_Date"]).ToString("dd MMM yyyy"),

                freightSONumber = r["Freight_SO_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["Freight_SO_Number"]),
                freightSONo = r["Freight_SO_No"] == DBNull.Value ? "" : r["Freight_SO_No"].ToString(),
                freightSODate = r["Freight_SO_Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["Freight_SO_Date"]).ToString("dd MMM yyyy"),

                customerNumber = r["JIDNH_JW_Customer_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIDNH_JW_Customer_Number"]),
                jwCustomerName = r["JW_Customer_Name"] == DBNull.Value ? "" : r["JW_Customer_Name"].ToString(),

                fromWHNumber = r["FromWH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["FromWH_Number"]),
                fromWH = r["FromWH"] == DBNull.Value ? "" : r["FromWH"].ToString(),
                toWHNumber = r["ToWH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["ToWH_Number"]),
                toWH = r["ToWH"] == DBNull.Value ? "" : r["ToWH"].ToString(),

                deliveredQty = r["DeliveredQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["DeliveredQty"]),
                invoicedQty = r["InvoicedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["InvoicedQty"]),
                pendingQty = r["PendingQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["PendingQty"])
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions { WriteIndented = true });
        }

        #endregion
    }
}