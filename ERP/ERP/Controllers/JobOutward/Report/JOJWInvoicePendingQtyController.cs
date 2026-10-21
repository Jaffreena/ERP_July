using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace ERP.Controllers.JobworkOutward
{
    public class JOJWInvoicePendingQtyController : Controller
    {
        #region Page

        [Route("jo/reports/jw-pending-qty")]
        public IActionResult Index()
        {
            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JOJWInvoicePendingQty/Index.cshtml");
        }

        #endregion

        #region Get Data

        [HttpGet]
        [Route("jo/reports/jw-pending-qty/get")]
        public JsonResult GetJOJWInvoicePendingQty(
            DateTime? FromDate,
            DateTime? ToDate,
            string RN_No,
            string VendorDN_No,
            string JW_SO_No,
            long? JW_Vendor_Number,
            long? JPRS_Number,
            long? ItemGroup_Number,
            long? Item_Number)
        {
            JOJWInvoicePendingQty_Filter_DTO filter = new JOJWInvoicePendingQty_Filter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                RN_No = RN_No,
                VendorDN_No = VendorDN_No,
                JW_SO_No = JW_SO_No,
                JW_Vendor_Number = JW_Vendor_Number,
                JPRS_Number = JPRS_Number,
                ItemGroup_Number = ItemGroup_Number,
                Item_Number = Item_Number
            };

            JOJWInvoicePendingQty_DAO dao = new JOJWInvoicePendingQty_DAO();
            DataTable dt = dao.JOJWInvoicePendingQtyDB(filter).Tables[0];

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

                jwSONumber = Lng(r, "JW_SO_Number"),
                jwSONo = Str(r, "JW_SO_No"),
                jwSODate = Dt(r, "JW_SO_Date"),

                jwVendorNumber = Lng(r, "JW_Vendor_Number"),
                jwVendorName = Str(r, "JW_Vendor_Name"),

                jprsNumber = Lng(r, "JPRS_Number"),
                processName = Str(r, "ProcessName"),

                itemGroupNumber = Lng(r, "ItemGroupNumber"),
                itemGroupName = Str(r, "ItemGroupName"),

                itemNumber = Lng(r, "Item_Number"),
                itemCode = Str(r, "ItemCode"),
                itemDescription = Str(r, "ItemDescription"),
                outerDia = Str(r, "OuterDia"),
                thickness = Str(r, "Thickness"),
                length = Str(r, "Length"),
                materialGrade = Str(r, "MaterialGrade"),

                uomNumber = Lng(r, "UoM_Number"),
                uom = Str(r, "UOM"),

                receivedQty = Dec(r, "ReceivedQty"),
                invoicedQty = Dec(r, "InvoicedQty"),
                pendingQty = Dec(r, "PendingQty")
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions { WriteIndented = true });
        }

        #endregion
    }
}