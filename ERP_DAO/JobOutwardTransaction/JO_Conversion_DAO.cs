using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JO_Conversion_DAO
    {
        DBConnect DB = new DBConnect();

        private const decimal Tol = 0.0005m;

        private static object DbV(object v) => v ?? DBNull.Value;

        #region masters / numbering lookup (JO_Conversion_SP)

        // Id 0 = numbering lookup for the date, Id 1 = masters (6 result sets)
        public DataSet JOConversionDB(int Id, DateTime? Date)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_Conversion_SP");

            db.AddInParameter(cmd, "@Id", DbType.Int32, Id);
            db.AddInParameter(cmd, "@Date", DbType.Date, Date.HasValue ? (object)Date.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        // running journal number for the date: Prefix + number (zero padded if PrefilZero) + Suffix
        public string JOConversionNextNumberDB(DateTime CNVDate)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JOCNV_GetNextNumber_SP");

            db.AddInParameter(cmd, "@Id", DbType.Int32, 101);
            db.AddInParameter(cmd, "@CNVDate", DbType.Date, CNVDate);
            db.AddOutParameter(cmd, "@NextNumber", DbType.Int32, 4);
            db.AddOutParameter(cmd, "@Prefix", DbType.String, 30);
            db.AddOutParameter(cmd, "@Suffix", DbType.String, 30);
            db.AddOutParameter(cmd, "@NumberOfDigits", DbType.Int32, 4);
            db.AddOutParameter(cmd, "@PrefilZero", DbType.Boolean, 1);

            db.ExecuteNonQuery(cmd);   // throws when no Reset row covers the date

            int next = Convert.ToInt32(db.GetParameterValue(cmd, "@NextNumber"));
            string prefix = Convert.ToString(db.GetParameterValue(cmd, "@Prefix")) ?? "";
            string suffix = Convert.ToString(db.GetParameterValue(cmd, "@Suffix")) ?? "";
            int digits = db.GetParameterValue(cmd, "@NumberOfDigits") == DBNull.Value ? 0 : Convert.ToInt32(db.GetParameterValue(cmd, "@NumberOfDigits"));
            bool pad = db.GetParameterValue(cmd, "@PrefilZero") != DBNull.Value && Convert.ToBoolean(db.GetParameterValue(cmd, "@PrefilZero"));

            string number = pad && digits > 0 ? next.ToString().PadLeft(digits, '0') : next.ToString();
            return prefix + number + suffix;
        }

        #endregion

        #region batch popup + temp reservation

        public DataSet GetBatchDetailsDB(long itemNumber, long warehouse, int itemGridIndex, int creatorCode, bool otherWarehouses)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_Conversion_GetBatch_SP");

            db.AddInParameter(cmd, "@Item_Number", DbType.Int64, itemNumber);
            db.AddInParameter(cmd, "@Warehouse", DbType.Int64, warehouse);
            db.AddInParameter(cmd, "@ItemGridIndex", DbType.Int64, itemGridIndex);
            db.AddInParameter(cmd, "@CreatorCode", DbType.Int32, creatorCode);
            db.AddInParameter(cmd, "@OtherWarehouses", DbType.Boolean, otherWarehouses);

            return db.ExecuteDataSet(cmd);
        }

        // Id 1 : save selected batch rows (one grid row's batches) to temp
        public void TempBatchSaveDB(List<JOConversionTempBatch_DTO> list, int creatorCode)
        {
            if (list == null || list.Count == 0) return;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        foreach (var t in list)
                        {
                            using (SqlCommand cmd = new SqlCommand("JO_Conversion_TempBatch_SP", con, tr))
                            {
                                cmd.CommandType = CommandType.StoredProcedure;
                                cmd.Parameters.AddWithValue("@Id", 1);
                                cmd.Parameters.AddWithValue("@CreatorCode", creatorCode);
                                cmd.Parameters.AddWithValue("@DBCH_Index", t.DBCH_Index);
                                cmd.Parameters.AddWithValue("@DBCH_DBCH_Number", t.DBCH_DBCH_Number);
                                cmd.Parameters.AddWithValue("@DBCH_Item_Number", t.DBCH_Item_Number);
                                cmd.Parameters.AddWithValue("@DBCH_Warehouse", t.DBCH_Warehouse_Number);
                                cmd.Parameters.AddWithValue("@DBCH_Date", t.DBCH_Date);
                                cmd.Parameters.AddWithValue("@DBCH_No", DbV(t.DBCH_No));
                                cmd.Parameters.AddWithValue("@DBCH_Qty", t.DBCH_Qty);
                                cmd.Parameters.AddWithValue("@DBCH_UnitPrice", t.DBCH_UnitPrice ?? 0m);
                                cmd.Parameters.AddWithValue("@DBCH_Value", t.DBCH_Value ?? 0m);
                                cmd.ExecuteNonQuery();
                            }
                        }
                        tr.Commit();
                    }
                    catch { tr.Rollback(); throw; }
                }
            }
        }

        // Id 2 : clear temp rows of given grid rows (this user)
        public void TempBatchClearRowsDB(List<int> gridIndexes, int creatorCode)
        {
            if (gridIndexes == null || gridIndexes.Count == 0) return;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        foreach (int idx in gridIndexes.Distinct())
                            TempSp(con, tr, 2, creatorCode, idx);
                        tr.Commit();
                    }
                    catch { tr.Rollback(); throw; }
                }
            }
        }

        // Id 3 : clear all temp rows of this user (page load / cancel)
        public void TempBatchClearUserDB(int creatorCode)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                TempSp(con, null, 3, creatorCode, 0);
            }
        }

        private void TempSp(SqlConnection con, SqlTransaction tr, int id, int creatorCode, int index)
        {
            using (SqlCommand cmd = new SqlCommand("JO_Conversion_TempBatch_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", id);
                cmd.Parameters.AddWithValue("@CreatorCode", creatorCode);
                cmd.Parameters.AddWithValue("@DBCH_Index", index);
                cmd.ExecuteNonQuery();
            }
        }

        #endregion

        #region SAVE

        public long JOConversionCreateDB(JOConversionCreate_DTO DTO, int creatorCode)
        {
            long headNumber = 0;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        var h = DTO.Header;
                        var consBatches = DTO.ConsBatches ?? new List<JOConversionConsBatch_DTO>();

                        //-------------------------------------------------
                        // 0. STOCK RECHECK (locks the IN rows, Q20)
                        //-------------------------------------------------
                        var need = new Dictionary<(long item, long wh, long line), decimal>();
                        foreach (var b in consBatches)
                        {
                            if (b.ItemMasterNumber <= 0 || b.JOCNVC_BCH_RefBatch_Number <= 0)
                                throw new InvalidOperationException("Consumption batch is incomplete (item / source batch missing).");

                            var key = (b.ItemMasterNumber, b.JOCNVC_BCH_WH_Number, b.JOCNVC_BCH_RefBatch_Number);
                            need[key] = (need.ContainsKey(key) ? need[key] : 0m) + b.JOCNVC_BCH_BatchQty;
                        }

                        foreach (var kv in need)
                        {
                            decimal available;
                            using (SqlCommand cmd = new SqlCommand("JO_Conversion_BatchAvailable_SP", con, tr))
                            {
                                cmd.CommandType = CommandType.StoredProcedure;
                                cmd.Parameters.AddWithValue("@Item_Number", kv.Key.item);
                                cmd.Parameters.AddWithValue("@Warehouse", kv.Key.wh);
                                cmd.Parameters.AddWithValue("@LineBatch", kv.Key.line);
                                object o = cmd.ExecuteScalar();
                                available = o == null || o == DBNull.Value ? 0m : Convert.ToDecimal(o);
                            }

                            if (kv.Value > available + Tol)
                                throw new InvalidOperationException(
                                    "Stock changed. Batch available qty is " + available.ToString("0.###") +
                                    ", but " + kv.Value.ToString("0.###") + " is selected. Please reselect the batch.");
                        }

                        //-------------------------------------------------
                        // 1. HEADER
                        //-------------------------------------------------
                        using (SqlCommand cmd = new SqlCommand(@"
                            INSERT INTO dbo.JO_ConversionHead
                            (JOCNVH_JournalNo, JOCNVH_Date, JOCNVH_MS_Number, JOCNVH_JSFT_Number,
                             JOCNVH_JWWC_Number, JOCNVH_JPRS_Number, JOCNVH_CreatorCode, JOCNVH_CreatorDate)
                            OUTPUT INSERTED.JOCNVH_Number
                            VALUES
                            (@JournalNo, @Date, @MS, @Shift, @WC, @PRS, @Creator, GETDATE())", con, tr))
                        {
                            cmd.Parameters.AddWithValue("@JournalNo", h.JOCNVH_JournalNo);
                            cmd.Parameters.AddWithValue("@Date", h.JOCNVH_Date);
                            cmd.Parameters.AddWithValue("@MS", h.JOCNVH_MS_Number);
                            cmd.Parameters.AddWithValue("@Shift", h.JOCNVH_JSFT_Number);
                            cmd.Parameters.AddWithValue("@WC", h.JOCNVH_JWWC_Number);
                            cmd.Parameters.AddWithValue("@PRS", h.JOCNVH_JPRS_Number);
                            cmd.Parameters.AddWithValue("@Creator", creatorCode);
                            headNumber = Convert.ToInt64(cmd.ExecuteScalar());
                        }

                        //-------------------------------------------------
                        // 2. CONSUMPTION ITEMS
                        //-------------------------------------------------
                        var insertedItems = new List<ItemMapDTO>();

                        foreach (var item in DTO.Items)
                        {
                            long itemNo;
                            using (SqlCommand cmd = new SqlCommand(@"
                                INSERT INTO dbo.JOCNV_Consumption
                                (JOCNVC_JOCNVH_Number, JOCNVC_Item_Number, JOCNVC_WH_Number, JOCNVC_UoM_Number,
                                 JOCNVC_ConsQty, JOCNVC_ConsQty_Kgs, JOCNVC_CreatorCode, JOCNVC_CreatorDate)
                                OUTPUT INSERTED.JOCNVC_Number
                                VALUES
                                (@H, @Item, @WH, @UoM, @Qty, @Kgs, @Creator, GETDATE())", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@H", headNumber);
                                cmd.Parameters.AddWithValue("@Item", item.JOCNVC_Item_Number);
                                cmd.Parameters.AddWithValue("@WH", item.JOCNVC_WH_Number);
                                cmd.Parameters.AddWithValue("@UoM", item.JOCNVC_UoM_Number);
                                cmd.Parameters.AddWithValue("@Qty", item.JOCNVC_ConsQty);
                                cmd.Parameters.AddWithValue("@Kgs", item.JOCNVC_ConsQty_Kgs);
                                cmd.Parameters.AddWithValue("@Creator", creatorCode);
                                itemNo = Convert.ToInt64(cmd.ExecuteScalar());
                            }

                            insertedItems.Add(new ItemMapDTO
                            {
                                ItemNumber = itemNo,
                                ItemMasterNumber = item.JOCNVC_Item_Number,
                                Qty = Convert.ToDecimal(item.JOCNVC_ConsQty)
                            });
                        }

                        //-------------------------------------------------
                        // 3. CONSUMPTION BATCH (FIFO split across items) + JO_OUT_COMMON_BATCH
                        //-------------------------------------------------
                        var remaining = consBatches.Select(x => x.JOCNVC_BCH_BatchQty).ToList();
                        int bi = 0;
                        long firstConsBatchNumber = 0;

                        foreach (var item in insertedItems)
                        {
                            decimal balance = item.Qty;

                            while (balance > Tol && bi < consBatches.Count)
                            {
                                var b = consBatches[bi];
                                decimal useQty = Math.Min(remaining[bi], balance);

                                remaining[bi] -= useQty;
                                if (remaining[bi] <= Tol) bi++;

                                decimal useValue = Math.Round(useQty * b.JOCNVC_BCH_BatchUnitPrice, 3);

                                long consBatchNo;
                                using (SqlCommand cmd = new SqlCommand(@"
                                    INSERT INTO dbo.JOCNVC_BATCH
                                    (JOCNVC_BCH_JOCNVH_Number, JOCNVC_BCH_JOCNVC_Number, JOCNVC_BCH_WH_Number,
                                     JOCNVC_BCH_BatchDate, JOCNVC_BCH_BatchNo, JOCNVC_BCH_BatchQty,
                                     JOCNVC_BCH_BatchUnitPrice, JOCNVC_BCH_BatchValue, JOCNVC_BCH_RefBatch_Number,
                                     JOCNVC_BCH_CreatorCode, JOCNVC_BCH_CreatorDate)
                                    OUTPUT INSERTED.JOCNVC_BCH_Number
                                    VALUES
                                    (@H, @C, @WH, @BDate, @BNo, @Qty, @Price, @Value, @Ref, @Creator, GETDATE())", con, tr))
                                {
                                    cmd.Parameters.AddWithValue("@H", headNumber);
                                    cmd.Parameters.AddWithValue("@C", item.ItemNumber);
                                    cmd.Parameters.AddWithValue("@WH", b.JOCNVC_BCH_WH_Number);
                                    cmd.Parameters.AddWithValue("@BDate", b.JOCNVC_BCH_BatchDate);
                                    cmd.Parameters.AddWithValue("@BNo", DbV(b.JOCNVC_BCH_BatchNo));
                                    cmd.Parameters.AddWithValue("@Qty", useQty);
                                    cmd.Parameters.AddWithValue("@Price", b.JOCNVC_BCH_BatchUnitPrice);
                                    cmd.Parameters.AddWithValue("@Value", useValue);
                                    cmd.Parameters.AddWithValue("@Ref", b.JOCNVC_BCH_RefBatch_Number);
                                    cmd.Parameters.AddWithValue("@Creator", creatorCode);
                                    consBatchNo = Convert.ToInt64(cmd.ExecuteScalar());
                                }

                                if (firstConsBatchNumber == 0)
                                    firstConsBatchNumber = consBatchNo;

                                using (SqlCommand cmd = new SqlCommand(@"
                                    INSERT INTO dbo.JO_OUT_COMMON_BATCH
                                    (JOOCB_TransType, JOOCB_TransDate, JOOCB_Header_Number, JOOCB_LineItem_Number,
                                     JOOCB_LineBatch_Number, JOOCB_Warehouse_Number, JOOCB_BatchDate, JOOCB_BatchNo,
                                     JOOCB_ItemStatus, JOOCB_BatchQty, JOOCB_BatchUnitPrice, JOOCB_BatchValue,
                                     JOOCB_RefBatch_Number, JOOCB_Item_Number, JOOCB_CreatorCode, JOOCB_CreatorDate)
                                    VALUES
                                    (@TransType, @TransDate, @H, @LineItem, @LineBatch, @WH, @BDate, @BNo,
                                     'Good', @Qty, @Price, @Value, @Ref, @ItemMaster, @Creator, GETDATE())", con, tr))
                                {
                                    cmd.Parameters.AddWithValue("@TransType", "JO Conversion Consumption");
                                    cmd.Parameters.AddWithValue("@TransDate", h.JOCNVH_Date);
                                    cmd.Parameters.AddWithValue("@H", headNumber);
                                    cmd.Parameters.AddWithValue("@LineItem", item.ItemNumber);
                                    cmd.Parameters.AddWithValue("@LineBatch", consBatchNo);
                                    cmd.Parameters.AddWithValue("@WH", b.JOCNVC_BCH_WH_Number);
                                    cmd.Parameters.AddWithValue("@BDate", b.JOCNVC_BCH_BatchDate);
                                    cmd.Parameters.AddWithValue("@BNo", DbV(b.JOCNVC_BCH_BatchNo));
                                    cmd.Parameters.AddWithValue("@Qty", useQty);
                                    cmd.Parameters.AddWithValue("@Price", b.JOCNVC_BCH_BatchUnitPrice);
                                    cmd.Parameters.AddWithValue("@Value", useValue);
                                    cmd.Parameters.AddWithValue("@Ref", b.JOCNVC_BCH_RefBatch_Number);   // source IN batch
                                    cmd.Parameters.AddWithValue("@ItemMaster", item.ItemMasterNumber);
                                    cmd.Parameters.AddWithValue("@Creator", creatorCode);
                                    cmd.ExecuteNonQuery();
                                }

                                balance -= useQty;
                            }

                            if (balance > Tol)
                                throw new InvalidOperationException("Consumption batch quantity is less than the item quantity.");
                        }

                        //-------------------------------------------------
                        // 4. PRODUCTION
                        //-------------------------------------------------
                        using (SqlCommand cmd = new SqlCommand("SP_JOCNV_Production_Insert", con, tr))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@JOCNVH_Number", headNumber);
                            cmd.Parameters.AddWithValue("@ConsumptionBatchNumber", firstConsBatchNumber);
                            cmd.Parameters.AddWithValue("@CreatorCode", creatorCode);

                            SqlParameter p1 = cmd.Parameters.AddWithValue("@ProductionItems", CreateProductionItemTable(DTO.Items_Production));
                            p1.SqlDbType = SqlDbType.Structured;
                            p1.TypeName = "dbo.JOCNV_ProductionItemType";

                            SqlParameter p2 = cmd.Parameters.AddWithValue("@ProductionBatches", CreateProductionBatchTable(DTO.ItemBatch_Production, DTO.Items_Production));
                            p2.SqlDbType = SqlDbType.Structured;
                            p2.TypeName = "dbo.JOCNV_ProductionBatchType";

                            cmd.ExecuteNonQuery();
                        }

                        //-------------------------------------------------
                        // 5. SCRAP
                        //-------------------------------------------------
                        using (SqlCommand cmd = new SqlCommand("SP_JOCNV_Scrap_Insert", con, tr))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@JOCNVH_Number", headNumber);
                            cmd.Parameters.AddWithValue("@ConsumptionBatchNumber", firstConsBatchNumber);
                            cmd.Parameters.AddWithValue("@CreatorCode", creatorCode);

                            SqlParameter p1 = cmd.Parameters.AddWithValue("@ScrapItems", CreateScrapItemTable(DTO.Items_Scrap));
                            p1.SqlDbType = SqlDbType.Structured;
                            p1.TypeName = "dbo.JOCNV_ScrapItemType";

                            SqlParameter p2 = cmd.Parameters.AddWithValue("@ScrapBatches", CreateScrapBatchTable(DTO.ItemBatch_Scrap, DTO.Items_Scrap));
                            p2.SqlDbType = SqlDbType.Structured;
                            p2.TypeName = "dbo.JOCNV_ScrapBatchType";

                            cmd.ExecuteNonQuery();
                        }

                        //-------------------------------------------------
                        // 6. CLEAR TEMP (this user only)
                        //-------------------------------------------------
                        TempSp(con, tr, 3, creatorCode, 0);

                        tr.Commit();
                    }
                    catch
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }

            return headNumber;
        }

        private DataTable CreateProductionItemTable(List<JOConversionProdItem_DTO> items)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("RowIndex", typeof(long));
            dt.Columns.Add("JOCNVP_Item_Number", typeof(long));
            dt.Columns.Add("JOCNVP_WH_Number", typeof(long));
            dt.Columns.Add("JOCNVP_UoM_Number", typeof(long));
            dt.Columns.Add("JOCNVP_ItemStatus", typeof(string));
            dt.Columns.Add("JOCNVP_ProdQty", typeof(decimal));
            dt.Columns.Add("JOCNVP_ProdQty_Kgs", typeof(decimal));

            if (items == null) return dt;

            long rowIndex = 1;
            foreach (var i in items)
            {
                dt.Rows.Add(rowIndex++, i.JOCNVP_Item_Number, i.JOCNVP_WH_Number, i.JOCNVP_UoM_Number,
                            string.IsNullOrWhiteSpace(i.JOCNVP_ItemStatus) ? "Good" : i.JOCNVP_ItemStatus,
                            i.JOCNVP_ProdQty, i.JOCNVP_ProdQty_Kgs);
            }
            return dt;
        }

        // JOCNVP_BCH_JOCNVP_Number from JS = 0-based index of the production item row
        private DataTable CreateProductionBatchTable(List<JOConversionProdBatch_DTO> batches, List<JOConversionProdItem_DTO> items)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("JOCNVP_BCH_JOCNVP_Number", typeof(long));
            dt.Columns.Add("ItemMasterNumber", typeof(long));
            dt.Columns.Add("JOCNVP_BCH_WH_Number", typeof(long));
            dt.Columns.Add("JOCNVP_BCH_BatchDate", typeof(DateTime));
            dt.Columns.Add("JOCNVP_BCH_BatchNo", typeof(string));
            dt.Columns.Add("JOCNVP_BCH_ItemStatus", typeof(string));
            dt.Columns.Add("JOCNVP_BCH_BatchQty", typeof(decimal));
            dt.Columns.Add("JOCNVP_BCH_BatchUnitPrice", typeof(decimal));
            dt.Columns.Add("JOCNVP_BCH_BatchValue", typeof(decimal));

            if (batches == null) return dt;

            foreach (var b in batches)
            {
                int idx = b.JOCNVP_BCH_JOCNVP_Number;
                if (items == null || idx < 0 || idx >= items.Count)
                    throw new InvalidOperationException("Production batch is linked to an invalid item row.");

                DateTime bd = b.JOCNVP_BCH_BatchDate.Year < 1900 ? DateTime.Today : b.JOCNVP_BCH_BatchDate;

                dt.Rows.Add(idx + 1L, items[idx].JOCNVP_Item_Number, b.JOCNVP_BCH_WH_Number, bd,
                            b.JOCNVP_BCH_BatchNo,
                            string.IsNullOrWhiteSpace(b.JOCNVP_BCH_ItemStatus) ? "Good" : b.JOCNVP_BCH_ItemStatus,
                            b.JOCNVP_BCH_BatchQty, b.JOCNVP_BCH_BatchUnitPrice, b.JOCNVP_BCH_BatchValue);
            }
            return dt;
        }

        private DataTable CreateScrapItemTable(List<JOConversionScrapItem_DTO> items)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("RowIndex", typeof(long));
            dt.Columns.Add("JOCNVS_Item_Number", typeof(long));
            dt.Columns.Add("JOCNVS_WH_Number", typeof(long));
            dt.Columns.Add("JOCNVS_UoM_Number", typeof(long));
            dt.Columns.Add("JOCNVS_ScrapQty", typeof(decimal));

            if (items == null) return dt;

            long rowIndex = 1;
            foreach (var i in items)
                dt.Rows.Add(rowIndex++, i.JOCNVS_Item_Number, i.JOCNVS_WH_Number, i.JOCNVS_UoM_Number, i.JOCNVS_ScrapQty);

            return dt;
        }

        // JOCNVS_BCH_JOCNVS_Number from JS = 0-based index of the scrap item row
        private DataTable CreateScrapBatchTable(List<JOConversionScrapBatch_DTO> batches, List<JOConversionScrapItem_DTO> items)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("JOCNVS_BCH_JOCNVS_Number", typeof(long));
            dt.Columns.Add("ItemMasterNumber", typeof(long));
            dt.Columns.Add("JOCNVS_BCH_WH_Number", typeof(long));
            dt.Columns.Add("JOCNVS_BCH_BatchDate", typeof(DateTime));
            dt.Columns.Add("JOCNVS_BCH_BatchNo", typeof(string));
            dt.Columns.Add("JOCNVS_BCH_BatchQty", typeof(decimal));
            dt.Columns.Add("JOCNVS_BCH_BatchUnitPrice", typeof(decimal));
            dt.Columns.Add("JOCNVS_BCH_BatchValue", typeof(decimal));

            if (batches == null) return dt;

            foreach (var b in batches)
            {
                int idx = b.JOCNVS_BCH_JOCNVS_Number;
                if (items == null || idx < 0 || idx >= items.Count)
                    throw new InvalidOperationException("Scrap batch is linked to an invalid item row.");

                DateTime bd = b.JOCNVS_BCH_BatchDate.Year < 1900 ? DateTime.Today : b.JOCNVS_BCH_BatchDate;

                dt.Rows.Add(idx + 1L, items[idx].JOCNVS_Item_Number, b.JOCNVS_BCH_WH_Number, bd,
                            b.JOCNVS_BCH_BatchNo,
                            b.JOCNVS_BCH_BatchQty, b.JOCNVS_BCH_BatchUnitPrice, b.JOCNVS_BCH_BatchValue);
            }
            return dt;
        }

        public class ItemMapDTO
        {
            public long ItemMasterNumber { get; set; }
            public long ItemNumber { get; set; }
            public decimal Qty { get; set; }
        }

        #endregion

        #region summary / detailed

        public DataSet JOConversionSummaryDB()
        {
            Database db = new SqlDatabase(DB.Connection());
            return db.ExecuteDataSet(db.GetStoredProcCommand("SP_JOCNV_Summary"));
        }

        public DataSet JOConversionDetailedDB()
        {
            Database db = new SqlDatabase(DB.Connection());
            return db.ExecuteDataSet(db.GetStoredProcCommand("SP_JOCNV_Detailed"));
        }

        #endregion

        #region numbering setup (JOCNV_Numbering_SP)

        // Id: 1 setup data, 11-14 inserts, 21-22, 31-33, 41-44, 51-53, 101-103 (as delivered in Step 2i)
        public DataSet JOConversionNumberingDB(int Id, JOConversionNumbering_DTO dto)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JOCNV_Numbering_SP");

            db.AddInParameter(cmd, "@Id", DbType.Int32, Id);
            db.AddInParameter(cmd, "@JOCN_Number", DbType.Int64, dto.JOCN_Number);
            db.AddInParameter(cmd, "@JOCN_Method", DbType.Int64, dto.JOCN_Method);
            db.AddInParameter(cmd, "@JOCN_Date", DbType.Int32, dto.JOCN_Date);
            db.AddInParameter(cmd, "@JOCN_EndDate", DbType.Int32, dto.JOCN_EndDate);
            db.AddInParameter(cmd, "@JOCN_StartingNumber", DbType.Int32, dto.JOCN_StartingNumber);
            db.AddInParameter(cmd, "@JOCN_NumberofDigits", DbType.Int32, dto.JOCN_NumberofDigits);
            db.AddInParameter(cmd, "@JOCN_PrefilZero", DbType.Int64, dto.JOCN_PrefilZero);
            db.AddInParameter(cmd, "@JOCN_Frequency", DbType.Int64, dto.JOCN_Frequency);
            db.AddInParameter(cmd, "@JOCN_Particulars", DbType.String, dto.JOCN_Particulars);
            db.AddInParameter(cmd, "@DeleteNumbers", DbType.String, dto.DeleteNumbers);
            db.AddInParameter(cmd, "@CreatorCode", DbType.Int32, dto.CreatorCode);

            return db.ExecuteDataSet(cmd);
        }

        #endregion
    }
}
