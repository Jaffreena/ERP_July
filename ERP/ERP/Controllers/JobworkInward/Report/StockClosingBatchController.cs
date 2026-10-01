using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;

namespace ERP.Controllers.JobworkInward.Report
{
    public class StockClosingBatchController : Controller
    {
        StockClosingBatch_DAO SCB_DAO = new StockClosingBatch_DAO();
        StockMovement_DAO SM_DAO = new StockMovement_DAO();   // reused only for the dropdown lists
        Help Help = new Help();

        [HttpGet]
        public IActionResult Index()
        {
            ViewBag.ItemGroup = Help.GetCat(SM_DAO.GetItemGroupList().Tables[0]);
            ViewBag.Warehouse = Help.GetCat(SM_DAO.GetWarehouseList().Tables[0]);
            ViewBag.Item = Help.GetCat(SM_DAO.GetItemList().Tables[0]);
            ViewBag.Collapse = true;
            return View(new StockMovementReport_DTO());
        }

        [HttpGet]
        public JsonResult GetStockClosingBatchData(DateTime? FromDate, DateTime? ToDate,
            long? ItemGroupNumber, long? WarehouseNumber, long? ItemNumber, string BatchNumber)
        {
            var filter = new StockMovementFilter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                ItemGroupNumber = ItemGroupNumber,
                WarehouseNumber = WarehouseNumber,
                ItemNumber = ItemNumber
            };

            DataTable dt = SCB_DAO.GetStockClosingBatchDB(filter, BatchNumber).Tables[0];

            string Str(DataRow r, string c) => r[c] == DBNull.Value ? "" : r[c].ToString();

            var rows = dt.AsEnumerable().Select(r => new
            {
                ItemGroupName = Str(r, "ItemGroupName"),
                ItemNumber = Str(r, "ItemNumber"),
                Description = Str(r, "Description"),
                OuterDia = Str(r, "OuterDia"),
                Thickness = Str(r, "Thickness"),
                Length = Str(r, "Length"),
                MaterialGrade = Str(r, "MaterialGrade"),
                BatchNumber = Str(r, "BatchNumber").Trim(),
                ClosingQty = r["ClosingQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["ClosingQty"])
            }).ToList();

            return new JsonResult(rows, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }
    }
}