using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace ERP.Controllers.JobworkOutward
{
    public class JODNFreightInvoicePendingQtyController : Controller
    {
        #region Page

        [Route("jo/reports/dn-freight-pending-qty")]
        public IActionResult Index()
        {
            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JODNFreightInvoicePendingQty/Index.cshtml");
        }

        #endregion

        #region Get Data

        [HttpGet]
        [Route("jo/reports/dn-freight-pending-qty/get")]
        public JsonResult GetJODNFreightInvoicePendingQty(
            DateTime? FromDate,
            DateTime? ToDate,
            string DN_No,
            string Freight_SO_No,
            long? JW_Vendor_Number)
        {
            JODNFreightInvoicePendingQty_Filter_DTO filter = new JODNFreightInvoicePendingQty_Filter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                DN_No = DN_No,
                Freight_SO_No = Freight_SO_No,
                JW_Vendor_Number = JW_Vendor_Number
            };

            JODNFreightInvoicePendingQty_DAO dao = new JODNFreightInvoicePendingQty_DAO();
            DataTable dt = dao.JODNFreightInvoicePendingQtyDB(filter).Tables[0];

            string Str(DataRow r, string c) => r[c] == DBNull.Value ? "" : r[c].ToString();
            long Lng(DataRow r, string c) => r[c] == DBNull.Value ? 0 : Convert.ToInt64(r[c]);
            decimal Dec(DataRow r, string c) => r[c] == DBNull.Value ? 0 : Convert.ToDecimal(r[c]);
            string Dt(DataRow r, string c) => r[c] == DBNull.Value ? "" : Convert.ToDateTime(r[c]).ToString("dd MMM yyyy");

            // explicit lowercase-starting names (no naming policy)
            var data = dt.AsEnumerable().Select(r => new
            {
                dnNumber = Lng(r, "JODNH_Number"),
                dnNo = Str(r, "JODNH_DN_No"),
                dnDate = Dt(r, "JODNH_DN_Date"),

                freightSONumber = Lng(r, "Freight_SO_Number"),
                freightSONo = Str(r, "Freight_SO_No"),
                freightSODate = Dt(r, "Freight_SO_Date"),

                jwVendorNumber = Lng(r, "JODNH_JW_Vendor_Number"),
                jwVendorName = Str(r, "JW_Vendor_Name"),

                fromWHNumber = Lng(r, "FromWH_Number"),
                fromWH = Str(r, "FromWH"),
                toWHNumber = Lng(r, "ToWH_Number"),
                toWH = Str(r, "ToWH"),

                deliveredQty = Dec(r, "DeliveredQty"),
                invoicedQty = Dec(r, "InvoicedQty"),
                pendingQty = Dec(r, "PendingQty")
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions { WriteIndented = true });
        }

        #endregion
    }
}