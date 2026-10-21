using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace ERP.Controllers.JobworkOutward
{
    public class JOJobworkSOPendingRegisterController : Controller
    {
        #region Page

        [Route("jo/reports/jobwork-so-pending-register")]
        public IActionResult Index()
        {
            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JOJobworkSOPendingRegister/Index.cshtml");
        }

        #endregion

        #region Get Data

        [HttpGet]
        [Route("jo/reports/jobwork-so-pending-register/get")]
        public JsonResult GetJOJobworkSOPendingRegister(
            DateTime? FromDate,
            DateTime? ToDate,
            string SO_No,
            long? JW_Vendor_Number,
            long? JPRS_Number,
            long? ItemGroup_Number,
            long? Item_Number)
        {
            JOJobworkSOPendingRegister_Filter_DTO filter = new JOJobworkSOPendingRegister_Filter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                SO_No = SO_No,
                JW_Vendor_Number = JW_Vendor_Number,
                JPRS_Number = JPRS_Number,
                ItemGroup_Number = ItemGroup_Number,
                Item_Number = Item_Number
            };

            JOJobworkSOPendingRegister_DAO dao = new JOJobworkSOPendingRegister_DAO();
            DataTable dt = dao.JOJobworkSOPendingRegisterDB(filter).Tables[0];

            string Str(DataRow r, string c) => r[c] == DBNull.Value ? "" : r[c].ToString();
            long Lng(DataRow r, string c) => r[c] == DBNull.Value ? 0 : Convert.ToInt64(r[c]);
            decimal Dec(DataRow r, string c) => r[c] == DBNull.Value ? 0 : Convert.ToDecimal(r[c]);
            string Dt(DataRow r, string c) => r[c] == DBNull.Value ? "" : Convert.ToDateTime(r[c]).ToString("dd MMM yyyy");

            // explicit lowercase-starting names (no naming policy)
            var data = dt.AsEnumerable().Select(r => new
            {
                svoNumber = Lng(r, "SVONumber"),
                svoNo = Str(r, "SVONo"),
                svoDate = Dt(r, "SVODate"),

                jwVendorNumber = Lng(r, "VendorNumber"),
                jwVendorName = Str(r, "JWVendorName"),

                svoItemNumber = Lng(r, "SVOItemNumber"),
                processNumber = Lng(r, "ProcessNumber"),
                processName = Str(r, "ProcessName"),

                itemGroupNumber = Lng(r, "ItemGroupNumber"),
                itemGroupName = Str(r, "ItemGroupName"),

                itemNumber = Lng(r, "ItemNumber"),
                itemCode = Str(r, "ItemCode"),
                itemDescription = Str(r, "ItemDescription"),
                outerDia = Str(r, "OuterDia"),
                thickness = Str(r, "Thickness"),
                length = Str(r, "Length"),
                materialGrade = Str(r, "MaterialGrade"),
                uom = Str(r, "UOM"),

                orderedQty = Dec(r, "OrderedQty"),
                rnAssignedQty = Dec(r, "RNAssignedQty"),
                directlyInvoicedQty = Dec(r, "DirectlyInvoicedQty"),
                pendingQty = Dec(r, "PendingQty")
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions { WriteIndented = true });
        }

        #endregion
    }
}