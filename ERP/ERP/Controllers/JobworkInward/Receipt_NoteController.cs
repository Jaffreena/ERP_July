using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;
using System.Transactions;

namespace ERP.Controllers.JobworkInward
{
    public class Receipt_NoteController : Controller
    {
        ReceiptNote_DTO SI_DTO = new ReceiptNote_DTO();
        ReceiptNote_DAO SI_DAO = new ReceiptNote_DAO();
        ReceiptNote_DL S_DL = new ReceiptNote_DL();
        Validation Valid = new Validation();
        Help Help = new Help();
        DataSet DS = new DataSet();
        public IActionResult Edit()
        {
            ReceiptNoteHead_DTO SH_DTO = new ReceiptNoteHead_DTO();
            if (TempData["SH_DTO_Json"] is string SHto)
            {
                SH_DTO = System.Text.Json.JsonSerializer.Deserialize<ReceiptNoteHead_DTO>(SHto);
            }
            SH_DTO.JW_CustomerDC_Date = DateTime.Now.ToString("dd-MMM-yy");
            //  SH_DTO.RN_No = OnReceiptNoteNumber(Convert.ToInt32(DateTime.Now.ToString("yyyyMMdd")));
            ReceiptGetData();
            ViewBag.Collapse = true;
            return View(SH_DTO);
        }
        public IActionResult Index()
        {
            ReceiptNoteHead_DTO SH_DTO = new ReceiptNoteHead_DTO();
            if (TempData["SH_DTO_Json"] is string SHto)
            {
                SH_DTO = System.Text.Json.JsonSerializer.Deserialize<ReceiptNoteHead_DTO>(SHto);
            }
            SH_DTO.JW_CustomerDC_Date = DateTime.Now.ToString("dd-MMM-yy");
            //  SH_DTO.RN_No = OnReceiptNoteNumber(Convert.ToInt32(DateTime.Now.ToString("yyyyMMdd")));
            ReceiptGetData();
            ViewBag.Collapse = true;
            return View(SH_DTO);
        }

        void ReceiptGetData()
        {
            SI_DTO.JIRNH_RN_Date = DateTime.Now;
            SI_DTO.JIRN_Id = 1;
            SI_DTO.JIRN_CreatorCode = Convert.ToInt64(1);
            DS = SI_DAO.JI_ReceiptNoteDB(SI_DTO);

            //ViewBag.IncomeCode = Help.GetCat(DS.Tables[0]);
            //ViewBag.Occurrence = Help.GetCat(DS.Tables[1]);
            //ViewBag.ChargeableMethod = Help.GetCat(DS.Tables[2]);
            //ViewBag.Allocate = Help.GetCat(DS.Tables[3]);
            //ViewBag.Currency = Help.GetCat(DS.Tables[4]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[0]);
            ViewBag.UoM = Help.GetCat(DS.Tables[1]);
            //ViewBag.LedgerAccount = Help.GetCat(DS.Tables[7]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[2]);
            ViewBag.PRS = Help.GetCat(DS.Tables[3]);
            //ViewBag.HSN = Help.GetCat(DS.Tables[9]);
            //ViewBag.WHTax = Help.GetCat(DS.Tables[10]);
            //ViewBag.IsCalculate = Help.GetCat(DS.Tables[11]);
            //ViewBag.AddressType = Help.GetCat(DS.Tables[12]);
        }

        [HttpPost]
        public IActionResult SaveReceiptNote([FromBody] ReceiptNoteCreate_DTO dto)
        {
            if (dto == null || dto.Header == null)
            {
                return Json(new
                {
                    success = false,
                    message = "Request data is missing."
                });
            }

            ReceiptNoteHead_DTO S_DTO = dto.Header;

            var Original_DTO = Help.JsonClone(S_DTO);

            bool IsValid = false;

            ReceiptNoteHead_DTO S_Head_DTO = S_DTO;

            List<ReceiptNoteItem_DTO> ITM_DTO = dto.Items?
                .Where(x => x.Item_Number != string.Empty)
                .ToList() ?? new List<ReceiptNoteItem_DTO>();

            List<ReceiptNoteBatch_DTO> BCH_DTO = dto.ItemBatch?
                .Where(x => x.RNI_BCH_IsDeleted == "false")
                .ToList() ?? new List<ReceiptNoteBatch_DTO>();

            string Mode = dto.Mode;

            SI_DTO.JIRN_CreatorCode = Convert.ToInt64(1);
            // SI_DTO.JIRN_CreatorCode = Convert.ToInt64(UserCode);
            if (Mode == "Save")
            {
                //var CheckItem = ITM_DTO.Where(x => Convert.ToInt64(x.Item_Number) != Convert.ToInt64(S_DTO.MS_Number));
                ITM_DTO = ITM_DTO
    .Where(x => !string.IsNullOrWhiteSpace(x.Item_Number))
    .ToList();
                var ValueItem = ITM_DTO.Where(x => Convert.ToDouble(x.Qty) == 0 || Convert.ToDouble(x.UnitPrice) == 0 || Convert.ToDouble(x.Amount) == 0);

                //if (CheckItem.ToList().Count > 0)
                //{
                //    ViewBag.ErrorCode = 2;
                //    ViewBag.ErrorMessage = "Material Segregation and Item Mismatched";
                //}
                //else
                if (ValueItem.Any())
                {
                    return Json(new
                    {
                        success = false,
                        message = "Qty or Unit Price Must above one"
                    });
                }
                else if (ITM_DTO.Count == 0)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Item Atleast, One Row Required"
                    });
                }
                else if (Convert.ToInt32(S_DTO.JWC_Number) == 0)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Buyer is Required"
                    });
                }
                else
                {
                    ModelState.Clear();
                    S_Head_DTO.Items = ITM_DTO;

                    if (!TryValidateModel(S_Head_DTO))
                    {
                        var errors = ModelState
                            .Where(x => x.Value.Errors.Count > 0)
                            .SelectMany(x => x.Value.Errors)
                            .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage)
                                ? e.Exception?.Message
                                : e.ErrorMessage)
                            .Where(e => !string.IsNullOrWhiteSpace(e))
                            .ToList();

                        return Json(new
                        {
                            success = false,
                            message = "Validation failed.",
                            errors = errors
                        });
                    }

                    // if (BatchValidation(ITM_DTO))
                    {
                        using (var transaction = new TransactionScope(
                            TransactionScopeOption.Required,
                            new TransactionOptions
                            {
                                IsolationLevel = System.Transactions.IsolationLevel.ReadCommitted
                            }))
                        {
                            try
                            {
                                string SIHOrderNoOld = S_DTO.RN_No;
                                string SIHOrderNoNew = SIHOrderNoOld;

                                // =========================
                                // HEADER INSERT
                                // =========================
                                SI_DTO.JIRNH_RN_Date = Convert.ToDateTime(S_DTO.RN_Date);
                                SI_DTO.JIRNH_RN_No = SIHOrderNoOld;
                                SI_DTO.JIRNH_JWC_Number = Convert.ToInt64(S_DTO.JWC_Number);
                                SI_DTO.JIRNH_Currency_Number = Convert.ToInt64(S_DTO.Currency_Number);
                                SI_DTO.JIRNH_JW_CustomerDC_No = Convert.ToString(S_DTO.JW_CustomerDC_No);
                                SI_DTO.JIRNH_JW_CustomerDC_Date = Convert.ToDateTime(S_DTO.JW_CustomerDC_Date);
                                SI_DTO.JIRNH_MS_Number = Convert.ToInt64(S_DTO.MS_Number);
                                SI_DTO.JIRNH_Remarks = Convert.ToString(S_DTO.Remarks);
                                SI_DTO.JIRNH_WH_Number = Convert.ToInt64(S_DTO.WH_Number);
                                SI_DTO.JIRN_Id = 21;

                                DS = SI_DAO.JI_ReceiptNoteDB(SI_DTO);

                                if (DS == null || DS.Tables.Count == 0 || DS.Tables[0].Rows.Count == 0)
                                    throw new Exception("Header insert failed");

                                long headerId = Convert.ToInt64(DS.Tables[0].Rows[0][0]);

                                // =========================
                                // ITEM INSERT
                                // =========================
                                Dictionary<int, long> itemIdMap = new Dictionary<int, long>();
                                Dictionary<int, long> itemWHMap = new Dictionary<int, long>();
                                Dictionary<int, long> itemNumberMap = new Dictionary<int, long>();

                                int itemIndex = 0;

                                foreach (var Item in ITM_DTO)
                                {
                                    var itemDTO = new ReceiptNote_DTO();

                                    itemDTO.JIRNH_Number = headerId;
                                    itemDTO.JIRNI_Item_Number = Convert.ToInt64(Item.Item_Number);
                                    itemDTO.JIRNI_WH_Number = Convert.ToInt64(Item.WH_Number);
                                    itemDTO.JIRNI_UoM_Number = Convert.ToInt64(Item.UoM_Number);
                                    itemDTO.JIRNI_Qty = Convert.ToDouble(Item.Qty);
                                    itemDTO.JIRNI_UnitPrice = Convert.ToDouble(Item.UnitPrice);
                                    itemDTO.JIRNI_Amount = Convert.ToDouble(Item.Amount);
                                    itemDTO.JIRNI_PRS_Number = Convert.ToInt64(Item.PRS_Number);
                                    itemDTO.JIRN_Id = 22;

                                    var itemResult = SI_DAO.JI_ReceiptNoteDB(itemDTO);

                                    if (itemResult == null || itemResult.Tables.Count == 0 || itemResult.Tables[0].Rows.Count == 0)
                                        throw new Exception("Item insert failed");

                                    long itemID = Convert.ToInt64(itemResult.Tables[0].Rows[0][0]);

                                    itemIdMap.Add(itemIndex, itemID);
                                    itemWHMap.Add(itemIndex, Convert.ToInt64(Item.WH_Number));
                                    itemNumberMap.Add(itemIndex, Convert.ToInt64(Item.Item_Number));

                                    itemIndex++;
                                }

                                // =========================
                                // BATCH INSERT
                                // =========================
                                foreach (var batch in BCH_DTO)
                                {
                                    var batchDTO = new ReceiptNote_DTO();

                                    batchDTO.JIRNI_BCH_Number = batch.RNI_BCH_No;
                                    batchDTO.JIRNH_Number = headerId;
                                    batchDTO.JIRNI_Number = itemIdMap[Convert.ToInt32(batch.RNI_BCH_Item_Index) - 1];
                                    batchDTO.JIRNI_Item_Number = itemNumberMap[Convert.ToInt32(batch.RNI_BCH_Item_Index) - 1];
                                    batchDTO.JIRNI_BCH_BatchDate = DateTime.Now;
                                    batchDTO.JIRNI_BCH_BatchNo = batch.RNI_BCH_Number;
                                    batchDTO.JIRNI_BCH_WH_Number = itemWHMap[Convert.ToInt32(batch.RNI_BCH_Item_Index) - 1];
                                    batchDTO.JIRNI_BCH_BatchQty = Convert.ToDouble(batch.RNI_BCH_Qty);
                                    batchDTO.JIRNI_BCH_BatchUnitPrice = Convert.ToDouble(batch.RNI_BCH_UnitPrice);
                                    batchDTO.JIRNI_BCH_BatchValue = Convert.ToDouble(batch.RNI_BCH_Value);
                                    batchDTO.JIRNI_WH_Number = itemWHMap[Convert.ToInt32(batch.RNI_BCH_Item_Index) - 1];
                                    batchDTO.JIRNH_WH_Number = Convert.ToInt32(S_DTO.WH_Number);
                                    batchDTO.JIRN_Id = 23;

                                    SI_DAO.JI_ReceiptNoteDB(batchDTO);
                                }

                                // =========================
                                // COMMIT
                                // =========================
                                transaction.Complete();

                                S_Head_DTO.Reset();
                                ITM_DTO = null;
                                S_DTO.Reset();
                                Original_DTO = Help.JsonClone(S_DTO);

                                if (SIHOrderNoOld != SIHOrderNoNew)
                                {
                                    ViewBag.ErrorCode = 2;
                                    ViewBag.ErrorMessage = "Receipt Note number " + SIHOrderNoOld + " changed to " + SIHOrderNoNew;
                                }
                            }
                            catch (Exception ex)
                            {
                                ViewBag.ErrorCode = 2;
                                ViewBag.ErrorMessage = Valid.CatchValid(ex.Message);
                                throw;
                            }
                        }
                    }
                }
            }


            return Json(new
            {
                success = false,
                message = "Invalid request."
            });
        }
        [HttpGet]
        [Route("jobinward/transactions/receipt-note/get")]
        public IActionResult GetReceiptNote(long JIRNH_Number)
        {
            ReceiptNote_DAO RN_DAO = new ReceiptNote_DAO();

            DataSet ds = RN_DAO.ReceiptNoteJSONDB(JIRNH_Number);

            if (ds.Tables.Count < 3 || ds.Tables[0].Rows.Count == 0)
            {
                return Json(new
                {
                    success = false,
                    message = "No data found."
                });
            }

            return Json(new
            {
                success = true,
                header = DataTableToList(ds.Tables[0]),
                items = DataTableToList(ds.Tables[1]) ,
                itemBatch= DataTableToList(ds.Tables[2])
            });
        }

        private List<Dictionary<string, object>> DataTableToList(DataTable dt)
        {
            var list = new List<Dictionary<string, object>>();

            foreach (DataRow row in dt.Rows)
            {
                var dict = new Dictionary<string, object>();

                foreach (DataColumn col in dt.Columns)
                {
                    object value = row[col];

                    dict[col.ColumnName] =
                        value == DBNull.Value
                            ? ""
                            : value;
                }

                list.Add(dict);
            }

            return list;
        }

        [HttpGet]
        [Route("jobinward/transactions/receipt-note/batch/get")]
        public IActionResult GetReceiptNoteBatch(long JIRNI_Number)
        {
            ReceiptNote_DAO RN_DAO = new ReceiptNote_DAO();
            DataSet ds = RN_DAO.ReceiptNoteBatchDB(JIRNI_Number);

            if (ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
            {
                return Json(new List<object>());
            }

            var result = ds.Tables[0]
                .AsEnumerable()
                .Select(row => ds.Tables[0].Columns
                    .Cast<DataColumn>()
                    .ToDictionary(
                        col => col.ColumnName,
                        col => row[col]
                    ))
                .ToList();

            return Json(result);
        }

        #region Update Receipt Note

        [HttpPost]
        public IActionResult UpdateReceiptNote([FromBody] ReceiptNoteCreate_DTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "DTO is NULL",
                        ModelState = ModelState
                            .Where(x => x.Value.Errors.Count > 0)
                            .Select(x => new
                            {
                                Field = x.Key,
                                Errors = x.Value.Errors.Select(e =>
                                    string.IsNullOrEmpty(e.ErrorMessage)
                                        ? e.Exception?.Message
                                        : e.ErrorMessage)
                            })
                    });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "ModelState is Invalid",
                        ModelState = ModelState
                            .Where(x => x.Value.Errors.Count > 0)
                            .Select(x => new
                            {
                                Field = x.Key,
                                Errors = x.Value.Errors.Select(e =>
                                    string.IsNullOrEmpty(e.ErrorMessage)
                                        ? e.Exception?.Message
                                        : e.ErrorMessage)
                            })
                    });
                }

                ReceiptNote_DAO RN_DAO = new ReceiptNote_DAO();

                RN_DAO.ReceiptNoteUpdateDB(dto);

                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action("ReceiptNoteSummary", "ReceiptNote")
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.ToString()
                });
            }
        }

        #endregion

    }
}
