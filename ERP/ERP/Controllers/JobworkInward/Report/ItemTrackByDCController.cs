using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;

namespace ERP.Controllers.JobworkInward.Report
{
    public class ItemTrackByDCController : Controller
    {
        ItemTrackByDC_DAO IT_DAO = new ItemTrackByDC_DAO();
        Help Help = new Help();

        [HttpGet]
        public IActionResult Index()
        {
            ViewBag.ItemGroup = Help.GetCat(IT_DAO.GetItemGroupList().Tables[0]);
            ViewBag.Item = Help.GetCat(IT_DAO.GetItemList().Tables[0]);
            ViewBag.Customer = Help.GetCat(IT_DAO.GetCustomerList().Tables[0]);
            ViewBag.Collapse = true;
            return View(new ItemTrackByDCReport_DTO());
        }

        [HttpGet]
        public JsonResult GetItemTrackByDCData(DateTime? FromDate, DateTime? ToDate, string DCNo,
            long? CustomerNumber, long? ItemGroupNumber, long? ItemNumber, string BatchNo)
        {
            var filter = new ItemTrackByDCFilter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                DCNo = DCNo,
                CustomerNumber = CustomerNumber,
                ItemGroupNumber = ItemGroupNumber,
                ItemNumber = ItemNumber,
                BatchNo = BatchNo
            };

            DataTable dt = IT_DAO.GetItemTrackByDCDB(filter).Tables[0];

            string Str(DataRow r, string c) => r[c] == DBNull.Value ? "" : r[c].ToString();
            decimal Dec(DataRow r, string c) => r[c] == DBNull.Value ? 0 : Convert.ToDecimal(r[c]);
            decimal? DecN(DataRow r, string c) => r[c] == DBNull.Value ? (decimal?)null : Convert.ToDecimal(r[c]);
            string Dt(DataRow r, string c) => r[c] == DBNull.Value ? "" : Convert.ToDateTime(r[c]).ToString("dd-MMM-yy");

            var rows = dt.AsEnumerable().Select(r => new
            {
                HeaderNo = Convert.ToInt64(r["HeaderNo"]),
                MotherId = Convert.ToInt64(r["MotherId"]),
                Lvl = Convert.ToInt32(r["Lvl"]),

                DCNo = Str(r, "DCNo"),
                DCDate = Dt(r, "DCDate"),
                RNDate = Dt(r, "RNDate"),
                JWCustomerName = Str(r, "JWCustomerName"),

                ItemGroupName = Str(r, "ItemGroupName"),
                ItemNumber = Str(r, "ItemNumber"),
                Description = Str(r, "Description"),
                OuterDia = Str(r, "OuterDia"),
                Thickness = Str(r, "Thickness"),
                Length = Str(r, "Length"),
                MaterialGrade = Str(r, "MaterialGrade"),

                ItemQty = DecN(r, "ItemQty"),
                Warehouse = Str(r, "Warehouse"),
                BatchDate = Dt(r, "BatchDate"),
                BatchNo = Str(r, "BatchNo"),
                BatchQty = Dec(r, "BatchQty"),

                Received = Dec(r, "Received"),
                Production = Dec(r, "Production"),
                InwardSum = Dec(r, "InwardSum"),
                Consumption = Dec(r, "Consumption"),
                Delivered = Dec(r, "Delivered"),
                OutwardSum = Dec(r, "OutwardSum"),
                ClosingQty = Dec(r, "ClosingQty")
            }).ToList();

            return new JsonResult(rows, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }
    }
}