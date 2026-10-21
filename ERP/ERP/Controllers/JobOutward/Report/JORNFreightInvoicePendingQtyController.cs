using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace ERP.Controllers.JobworkOutward
{
    public class JORNFreightInvoicePendingQtyController : Controller
    {
        #region Page

        [Route("jo/reports/rn-freight-pending-qty")]
        public IActionResult Index()
        {
            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JORNFreightInvoicePendingQty/Index.cshtml");
        }

        #endregion

        #region Get Data

        [HttpGet]
        [Route("jo/reports/rn-freight-pending-qty/get")]
        public JsonResult GetJORNFreightInvoicePendingQty(
            DateTime? FromDate,
            DateTime? ToDate,
            string RN_No,
            string VendorDN_No,
            string Freight_SO_No,
            long? JW_Vendor_Number)
        {
            JORNFreightInvoicePendingQty_Filter_DTO filter = new JORNFreightInvoicePendingQty_Filter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                RN_No = RN_No,
                VendorDN_No = VendorDN_No,
                Freight_SO_No = Freight_SO_No,
                JW_Vendor_Number = JW_Vendor_Number
            };

            JORNFreightInvoicePendingQty_DAO dao = new JORNFreightInvoicePendingQty_DAO();
            DataTable dt = dao.JORNFreightInvoicePendingQtyDB(filter).Tables[0];

            string Str(DataRow r, string c) => r[c] == DBNull.Value ? "" : r[c].ToString();
            long Lng(DataRow r, string c) => r[c] == DBNull.Value ? 0 : Convert.ToInt64(r[c]);
            decimal Dec(DataRow r, string c) => r[c] == DBNull.Value ? 0 : Convert.ToDecimal(r[c]);
            string Dt(DataRow r, string c) => r[c] == DBNull.Value ? "" : Convert.ToDateTime(r[c]).ToString("dd MMM yyyy");

            // explicit lowercase-starting names (no naming policy)
            var data = dt.AsEnumerable().Select(r => new
            {
                rnNumber = Lng(r, "RNNumber"),
                rnNo = Str(r, "RNNo"),
                rnDate = Dt(r, "RNDate"),

                vendorDCNo = Str(r, "VendorDCNo"),
                vendorDCDate = Dt(r, "VendorDCDate"),

                freightSONumber = Lng(r, "FreightSONumber"),
                freightSONo = Str(r, "FreightSONo"),
                freightSODate = Dt(r, "FreightSODate"),

                jwVendorNumber = Lng(r, "JW_Vendor_Number"),
                jwVendorName = Str(r, "JW_Vendor_Name"),

                fromWHNumber = Lng(r, "FromWHNumber"),
                fromWH = Str(r, "FromWH"),
                toWHNumber = Lng(r, "ToWHNumber"),
                toWH = Str(r, "ToWH"),

                receivedQty = Dec(r, "ReceivedQty"),
                invoicedQty = Dec(r, "InvoicedQty"),
                pendingQty = Dec(r, "PendingQty")
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions { WriteIndented = true });
        }

        #endregion
    }
}