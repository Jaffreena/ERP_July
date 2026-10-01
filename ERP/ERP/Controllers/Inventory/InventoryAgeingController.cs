using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;

namespace ERP.Controllers.JobworkInward.Report
{
    public class InventoryAgeingController : Controller
    {
        InventoryAgeing_DAO IA_DAO = new InventoryAgeing_DAO();
        StockMovement_DAO SM_DAO = new StockMovement_DAO();   // reused only for the dropdown lists
        Help Help = new Help();

        // default buckets shown on first page load (matches the Excel sample)
        static List<AgeingBucketRange_DTO> DefaultBuckets() => new List<AgeingBucketRange_DTO>
        {
            new AgeingBucketRange_DTO { From = 0,   To = 30  },
            new AgeingBucketRange_DTO { From = 31,  To = 60  },
            new AgeingBucketRange_DTO { From = 61,  To = 90  },
            new AgeingBucketRange_DTO { From = 91,  To = 180 },
            new AgeingBucketRange_DTO { From = 181, To = null }
        };

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
        public JsonResult GetInventoryAgeingData(DateTime? ClosingDate,
            long? ItemGroupNumber, long? WarehouseNumber, long? ItemNumber, string BatchNumber,
            string Buckets)
        {
            // ---- parse + validate bucket ranges ----
            List<AgeingBucketRange_DTO> buckets;
            try
            {
                buckets = string.IsNullOrWhiteSpace(Buckets)
          ? DefaultBuckets()
          : JsonSerializer.Deserialize<List<AgeingBucketRange_DTO>>(Buckets,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (JsonException)
            {
                return new JsonResult(new { error = "Invalid bucket range data." });
            }

            if (buckets == null || buckets.Count == 0 || buckets.Count > 10)
                return new JsonResult(new { error = "Provide between 1 and 10 ageing buckets." });

            var ordered = buckets.OrderBy(b => b.From).ToList();
            for (int i = 0; i < ordered.Count; i++)
            {
                if (ordered[i].To.HasValue && ordered[i].To.Value < ordered[i].From)
                    return new JsonResult(new { error = $"Bucket {ordered[i].From}-{ordered[i].To} is invalid (To < From)." });

                bool isLast = i == ordered.Count - 1;
                if (!ordered[i].To.HasValue && !isLast)
                    return new JsonResult(new { error = "Only the last bucket can be open-ended (blank To)." });

                if (i > 0)
                {
                    var prev = ordered[i - 1];
                    if (!prev.To.HasValue || ordered[i].From <= prev.To.Value)
                        return new JsonResult(new { error = $"Buckets overlap around {prev.From}-{prev.To} and {ordered[i].From}-{ordered[i].To}." });
                }
            }

            // ---- labels, in the same order as 'ordered' ----
            var labels = ordered.Select((b, i) =>
                i == 0 ? $"<  {b.To} days"
                : !b.To.HasValue ? $">  {b.From} days"
                : $"{b.From} - {b.To} days"
            ).ToList();

            // ---- fetch data ----
            var filter = new InventoryAgeingFilter_DTO
            {
                ClosingDate = ClosingDate,
                ItemGroupNumber = ItemGroupNumber,
                WarehouseNumber = WarehouseNumber,
                ItemNumber = ItemNumber
            };

            DataTable dt = IA_DAO.GetInventoryAgeingDB(filter, BatchNumber).Tables[0];

            string Str(DataRow r, string c) => r[c] == DBNull.Value ? "" : r[c].ToString();

            var rows = dt.AsEnumerable().Select(r =>
            {
                int days = r["Days"] == DBNull.Value ? 0 : Convert.ToInt32(r["Days"]);
                decimal closingQty = r["ClosingQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["ClosingQty"]);

                var row = new Dictionary<string, object>
                {
                    ["itemGroupName"] = Str(r, "ItemGroupName"),
                    ["itemNumber"] = Str(r, "ItemNumber"),
                    ["description"] = Str(r, "Description"),
                    ["outerDia"] = Str(r, "OuterDia"),
                    ["thickness"] = Str(r, "Thickness"),
                    ["length"] = Str(r, "Length"),
                    ["materialGrade"] = Str(r, "MaterialGrade"),
                    ["batchDate"] = r["BatchDate"] == DBNull.Value ? null : (object)Convert.ToDateTime(r["BatchDate"]),
                    ["batchNumber"] = Str(r, "BatchNumber").Trim(),
                    ["closingQty"] = closingQty,
                    ["days"] = days
                };

                // place ClosingQty into exactly one bucket column, others left at 0
                for (int i = 0; i < ordered.Count; i++)
                {
                    bool inBucket = days >= ordered[i].From && (!ordered[i].To.HasValue || days <= ordered[i].To.Value);
                    row[labels[i]] = inBucket ? closingQty : 0m;
                }

                return row;
            }).ToList();

            return new JsonResult(new { buckets = labels, rows }, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }
    }
}