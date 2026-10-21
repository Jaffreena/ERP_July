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
    public class JO_ReceiptNote_DAO
    {
        DBConnect DB = new DBConnect();

        private class ItemMapDTO
        {
            public long ItemMasterNumber { get; set; }
            public long ItemNumber { get; set; }
            public decimal Qty { get; set; }
        }

        private class StockBatchWork
        {
            public long RefBatch { get; set; }
            public long WH { get; set; }
            public DateTime BatchDate { get; set; }
            public string BatchNo { get; set; }
            public decimal Qty { get; set; }
            public decimal UnitPrice { get; set; }
        }

        #region Get data (master / vendor search / numbering) - JO_ReceiptNote_SP
        public DataSet JO_ReceiptNoteDB(JO_ReceiptNoteCreate_DTO RN_DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_SP");

            DateTime rnDate = RN_DTO.Header.JORNH_RN_Date == DateTime.MinValue
                ? DateTime.Now
                : RN_DTO.Header.JORNH_RN_Date;

            db.AddInParameter(cmd, "@RN_Id", DbType.Int32, RN_DTO.Header.RN_Id);
            db.AddInParameter(cmd, "@JORNH_RN_Date", DbType.Date, rnDate);
            db.AddInParameter(cmd, "@Search_Text", DbType.String, RN_DTO.Header.JORNI_Item_Code);

            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region Edit / View data
        public DataSet JO_ReceiptNoteEditDB(long JORNH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_Edit_SP");
            db.AddInParameter(cmd, "@JORNH_Number", DbType.Int64, JORNH_Number);
            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region Summary / Detailed
        public DataSet JO_ReceiptNoteSummaryDB(JO_ReceiptNoteSummary_DTO RN_DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_Summary_SP");
            db.AddInParameter(cmd, "@RN_Id", DbType.Int32, RN_DTO.RN_Id);
            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region Temp batch table helpers
        public void DeleteTempReceiptNoteBatch()
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                using (SqlCommand cmd = new SqlCommand("DELETE FROM temp_JO_ReceiptNoteBatch", con))
                {
                    cmd.ExecuteNonQuery();
                }
            }
        }

        // Edit page open : saved batches -> temp table
        public void InsertEditBatchToTempDB(long JORNI_Number)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_InsertEditBatchToTemp_SP");
                db.AddInParameter(cmd, "@JORNI_Number", DbType.Int64, JORNI_Number);
                db.ExecuteNonQuery(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_ReceiptNote_InsertEditBatchToTemp_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        // Popup Save : one grid row's batch rows. Saved batch rows keep their number.
        public void TempReceiptBatchSaveDB(List<TempJO_ReceiptBatch_DTO> list)
        {
            if (list == null || list.Count == 0)
                return;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        var first = list.First();

                        // stock batch -> already saved batch row number (so number never changes)
                        Dictionary<long, long> saved = new Dictionary<long, long>();
                        using (SqlCommand sel = new SqlCommand(@"
                            SELECT ISNULL(DBCH_DBCH_Number,0) AS Src, DBCH_Number
                            FROM temp_JO_ReceiptNoteBatch
                            WHERE DBCH_Index = @DBCH_Index AND ISNULL(DBCH_Number,0) > 0", con, tr))
                        {
                            sel.Parameters.AddWithValue("@DBCH_Index", first.DBCH_Index);
                            using (SqlDataReader rd = sel.ExecuteReader())
                            {
                                while (rd.Read())
                                {
                                    long src = Convert.ToInt64(rd["Src"]);
                                    if (!saved.ContainsKey(src))
                                        saved.Add(src, Convert.ToInt64(rd["DBCH_Number"]));
                                }
                            }
                        }

                        using (SqlCommand delCmd = new SqlCommand(
                            "DELETE FROM temp_JO_ReceiptNoteBatch WHERE DBCH_Index = @DBCH_Index", con, tr))
                        {
                            delCmd.Parameters.AddWithValue("@DBCH_Index", first.DBCH_Index);
                            delCmd.ExecuteNonQuery();
                        }

                        foreach (var obj in list.Where(x => x.DBCH_Qty > 0))
                        {
                            long src = obj.DBCH_DBCH_Number ?? 0;
                            long savedNo = saved.ContainsKey(src) ? saved[src] : 0;

                            using (SqlCommand cmd = new SqlCommand(@"
                                INSERT INTO temp_JO_ReceiptNoteBatch
                                (
                                    DBCH_RowGuid, DBCH_Number, DBCH_Index, DBCH_DBCH_Number, DBCH_Item_Number,
                                    JORNI_NUMBER, JORNH_NUMBER, RefBatch_Number, DBCH_Warehouse_Number,
                                    DBCH_Date, DBCH_No, DBCH_Qty, DBCH_UnitPrice, DBCH_Value,
                                    Mode, CreatorCode, CreatorDate
                                )
                                VALUES
                                (
                                    CAST(NEWID() AS NVARCHAR(100)), @DBCH_Number, @DBCH_Index, @DBCH_DBCH_Number, @DBCH_Item_Number,
                                    @JORNI_NUMBER, @JORNH_NUMBER, @RefBatch_Number, @DBCH_Warehouse_Number,
                                    @DBCH_Date, @DBCH_No, @DBCH_Qty, @DBCH_UnitPrice, @DBCH_Value,
                                    @Mode, @CreatorCode, @CreatorDate
                                )", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@DBCH_Number", savedNo);
                                cmd.Parameters.AddWithValue("@DBCH_Index", obj.DBCH_Index);
                                cmd.Parameters.AddWithValue("@DBCH_DBCH_Number", (object?)obj.DBCH_DBCH_Number ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@DBCH_Item_Number", obj.DBCH_Item_Number);
                                cmd.Parameters.AddWithValue("@JORNI_NUMBER", obj.JORNI_NUMBER ?? 0);
                                cmd.Parameters.AddWithValue("@JORNH_NUMBER", obj.JORNH_NUMBER ?? 0);
                                cmd.Parameters.AddWithValue("@RefBatch_Number", obj.RefBatch_Number ?? obj.DBCH_DBCH_Number ?? 0);
                                cmd.Parameters.AddWithValue("@DBCH_Warehouse_Number", obj.DBCH_Warehouse_Number);
                                cmd.Parameters.AddWithValue("@DBCH_Date", obj.DBCH_Date);
                                cmd.Parameters.AddWithValue("@DBCH_No", (object?)obj.DBCH_No ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@DBCH_Qty", (double)obj.DBCH_Qty);
                                cmd.Parameters.AddWithValue("@DBCH_UnitPrice", obj.DBCH_UnitPrice.HasValue ? (object)(double)obj.DBCH_UnitPrice.Value : DBNull.Value);
                                cmd.Parameters.AddWithValue("@DBCH_Value", obj.DBCH_Value.HasValue ? (object)(double)obj.DBCH_Value.Value : DBNull.Value);
                                cmd.Parameters.AddWithValue("@Mode", obj.Mode ?? 1);
                                cmd.Parameters.AddWithValue("@CreatorCode", obj.CreatorCode);
                                cmd.Parameters.AddWithValue("@CreatorDate", obj.CreatorDate);
                                cmd.ExecuteNonQuery();
                            }
                        }

                        tr.Commit();
                    }
                    catch
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }
        }

        // Grid row removed (Create page) : delete its temp rows and renumber the rest
        public void TempReceiptBatchDeleteDBRow(int index)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        using (SqlCommand delCmd = new SqlCommand(
                            "DELETE FROM temp_JO_ReceiptNoteBatch WHERE DBCH_Index = @DBCH_Index", con, tr))
                        {
                            delCmd.Parameters.AddWithValue("@DBCH_Index", index);
                            delCmd.ExecuteNonQuery();
                        }

                        using (SqlCommand seqCmd = new SqlCommand(@"
                            ;WITH Grouped AS
                            (
                                SELECT DISTINCT DBCH_Index FROM temp_JO_ReceiptNoteBatch
                            ),
                            Renumber AS
                            (
                                SELECT DBCH_Index, ROW_NUMBER() OVER (ORDER BY DBCH_Index) AS NewIndex
                                FROM Grouped
                            )
                            UPDATE t
                            SET t.DBCH_Index = r.NewIndex
                            FROM temp_JO_ReceiptNoteBatch t
                            JOIN Renumber r ON t.DBCH_Index = r.DBCH_Index;", con, tr))
                        {
                            seqCmd.ExecuteNonQuery();
                        }

                        tr.Commit();
                    }
                    catch
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }
        }

        // Edit page : Item / Warehouse changed on a grid row -> its batch rows are cleared, user picks again
        public void TempReceiptBatchEditChangeItemDBRow(long JORNI_Number, long JORNH_Number, int DBCH_Index)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlCommand cmd = new SqlCommand(@"
                    DELETE FROM temp_JO_ReceiptNoteBatch
                    WHERE (@JORNI_Number <> 0 AND JORNI_NUMBER = @JORNI_Number AND JORNH_NUMBER = @JORNH_Number)
                       OR (@JORNI_Number = 0 AND DBCH_Index = @DBCH_Index)", con))
                {
                    cmd.Parameters.AddWithValue("@JORNI_Number", JORNI_Number);
                    cmd.Parameters.AddWithValue("@JORNH_Number", JORNH_Number);
                    cmd.Parameters.AddWithValue("@DBCH_Index", DBCH_Index);
                    cmd.ExecuteNonQuery();
                }
            }
        }
        #endregion

        #region Batch popup data
        public DataSet GetBatchDetailsDB(long fromWarehouse, long itemNumber, int ItemGridIndex)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_InCommonBatch_GetBatchDetails_SP");
                db.AddInParameter(cmd, "@FromWarehouse", DbType.Int64, fromWarehouse);
                db.AddInParameter(cmd, "@Item_Number", DbType.Int64, itemNumber);
                db.AddInParameter(cmd, "@ItemGridIndex", DbType.Int64, ItemGridIndex);
                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_ReceiptNote_InCommonBatch_GetBatchDetails_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        public DataSet GetOtherBatchDetailsDB(long fromWarehouse, long itemNumber, int ItemGridIndex)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_InCommonOtherBatch_GetBatchDetails_SP");
                db.AddInParameter(cmd, "@FromWarehouse", DbType.Int64, fromWarehouse);
                db.AddInParameter(cmd, "@Item_Number", DbType.Int64, itemNumber);
                db.AddInParameter(cmd, "@ItemGridIndex", DbType.Int64, ItemGridIndex);
                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_ReceiptNote_InCommonOtherBatch_GetBatchDetails_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        // View page : saved batches of one item row
        public DataSet GetBatchDetailsViewDB(long fromWarehouse, long JORNI_Number)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_BatchView_SP");
                db.AddInParameter(cmd, "@FromWarehouse", DbType.Int64, fromWarehouse);
                db.AddInParameter(cmd, "@JORNI_Number", DbType.Int64, JORNI_Number);
                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_ReceiptNote_BatchView_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }
        #endregion

        #region Batch validations
        // "" = OK, otherwise the message
        public string ValidateBatchDetails(long JORNH_Number)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_ValidateBatchDetails_SP");
                db.AddInParameter(cmd, "@JORNH_Number", DbType.Int64, JORNH_Number);
                object result = db.ExecuteScalar(cmd);
                return Convert.ToString(result);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message, ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        // grid row index -> total batch qty in temp table (JS compares with grid qty). 0 = Create page
        public List<JO_RN_BatchQtyValidationDto> Validate_Amended_BatchQty(long JORNH_Number)
        {
            List<JO_RN_BatchQtyValidationDto> result = new List<JO_RN_BatchQtyValidationDto>();

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlCommand cmd = new SqlCommand(@"
                    SELECT DBCH_Index, SUM(ISNULL(DBCH_Qty,0)) AS DBCH_Qty
                    FROM temp_JO_ReceiptNoteBatch
                    WHERE (@JORNH_Number = 0 OR JORNH_NUMBER = @JORNH_Number)
                    GROUP BY DBCH_Index", con))
                {
                    cmd.Parameters.Add("@JORNH_Number", SqlDbType.BigInt).Value = JORNH_Number;

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            result.Add(new JO_RN_BatchQtyValidationDto
                            {
                                DBCH_Index = Convert.ToInt32(reader["DBCH_Index"]),
                                DBCH_Qty = Convert.ToDecimal(reader["DBCH_Qty"])
                            });
                        }
                    }
                }
            }

            return result;
        }
        #endregion

        #region Create (one transaction)
        public long JO_ReceiptNoteCreateDB(JO_ReceiptNoteCreate_DTO RN_DTO)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        var h = RN_DTO.Header;
                        long RN_Number = 0;

                        // ---------------- HEADER ----------------
                        using (SqlCommand cmd = new SqlCommand(@"
                            INSERT INTO JO_ReceiptNoteHead
                            (
                                JORNH_RN_No, JORNH_RN_Date, JORNH_VendorDC_No, JORNH_VendorDC_Date,
                                JORNH_MS_Number, JORNH_JW_Vendor_Number, JORNH_Currency_Number, JORNH_WH_Number,
                                JORNH_Remarks, JORNH_IsFreightApplicable
                            )
                            OUTPUT INSERTED.JORNH_Number
                            VALUES
                            (
                                @JORNH_RN_No, @JORNH_RN_Date, @JORNH_VendorDC_No, @JORNH_VendorDC_Date,
                                @JORNH_MS_Number, @JORNH_JW_Vendor_Number, @JORNH_Currency_Number, @JORNH_WH_Number,
                                @JORNH_Remarks, @JORNH_IsFreightApplicable
                            )", con, tr))
                        {
                            cmd.Parameters.AddWithValue("@JORNH_RN_No", h.JORNH_RN_No);
                            cmd.Parameters.AddWithValue("@JORNH_RN_Date", h.JORNH_RN_Date);
                            cmd.Parameters.AddWithValue("@JORNH_VendorDC_No", h.JORNH_VendorDC_No ?? "");
                            cmd.Parameters.AddWithValue("@JORNH_VendorDC_Date", h.JORNH_VendorDC_Date);
                            cmd.Parameters.AddWithValue("@JORNH_MS_Number", h.JORNH_MS_Number);
                            cmd.Parameters.AddWithValue("@JORNH_JW_Vendor_Number", h.JORNH_JW_Vendor_Number);
                            cmd.Parameters.AddWithValue("@JORNH_Currency_Number", h.JORNH_Currency_Number);
                            cmd.Parameters.AddWithValue("@JORNH_WH_Number", h.JORNH_WH_Number);
                            cmd.Parameters.AddWithValue("@JORNH_Remarks", h.JORNH_Remarks ?? "");
                            cmd.Parameters.AddWithValue("@JORNH_IsFreightApplicable", h.JORNH_IsFreightApplicable ?? "No");

                            RN_Number = Convert.ToInt64(cmd.ExecuteScalar());
                        }

                        // ---------------- ITEMS ----------------
                        List<ItemMapDTO> insertedItems = new List<ItemMapDTO>();

                        foreach (var item in RN_DTO.Items)
                        {
                            bool isJWIRow = item.JORNI_IsJW_InvoiceApplicable == "Yes";
                            bool isFreightRow = item.JORNI_IsFreightApplicable == "Yes";
                            long insertedItemNumber = 0;

                            using (SqlCommand cmd = new SqlCommand(@"
                                INSERT INTO JO_ReceiptNoteItem
                                (
                                    JORNI_JORNH_Number, JORNI_JPRS_Number, JORNI_Item_Number, JORNI_WH_Number, JORNI_UoM_Number,
                                    JORNI_Qty, JORNI_Qty_Kgs, JORNI_UnitPrice, JORNI_Amount,
                                    JORNI_IsJW_InvoiceApplicable, JORNI_JOJWI_SVOH_Number, JORNI_JOJWI_SVOI_Number,
                                    JORNI_IsFreightApplicable, JORNI_FromWH_Number, JORNI_ToWH_Number,
                                    JORNI_JOFRT_SVOH_Number, JORNI_JOFRT_SVOI_Number
                                )
                                OUTPUT INSERTED.JORNI_Number
                                VALUES
                                (
                                    @JORNI_JORNH_Number, @JORNI_JPRS_Number, @JORNI_Item_Number, @JORNI_WH_Number, @JORNI_UoM_Number,
                                    @JORNI_Qty, @JORNI_Qty_Kgs, @JORNI_UnitPrice, @JORNI_Amount,
                                    @JORNI_IsJW_InvoiceApplicable, @JORNI_JOJWI_SVOH_Number, @JORNI_JOJWI_SVOI_Number,
                                    @JORNI_IsFreightApplicable, @JORNI_FromWH_Number, @JORNI_ToWH_Number,
                                    @JORNI_JOFRT_SVOH_Number, @JORNI_JOFRT_SVOI_Number
                                )", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@JORNI_JORNH_Number", RN_Number);
                                cmd.Parameters.AddWithValue("@JORNI_JPRS_Number", item.JORNI_JPRS_Number);
                                cmd.Parameters.AddWithValue("@JORNI_Item_Number", item.JORNI_Item_Number);
                                cmd.Parameters.AddWithValue("@JORNI_WH_Number", item.JORNI_WH_Number);
                                cmd.Parameters.AddWithValue("@JORNI_UoM_Number", item.JORNI_UoM_Number);
                                cmd.Parameters.AddWithValue("@JORNI_Qty", item.JORNI_Qty);
                                cmd.Parameters.AddWithValue("@JORNI_Qty_Kgs", item.JORNI_Qty_Kgs);
                                cmd.Parameters.AddWithValue("@JORNI_UnitPrice", item.JORNI_UnitPrice);
                                cmd.Parameters.AddWithValue("@JORNI_Amount", item.JORNI_Amount);
                                cmd.Parameters.AddWithValue("@JORNI_IsJW_InvoiceApplicable", item.JORNI_IsJW_InvoiceApplicable ?? "No");
                                cmd.Parameters.AddWithValue("@JORNI_JOJWI_SVOH_Number", isJWIRow ? (item.JORNI_JOJWI_SVOH_Number ?? 0) : 0);
                                cmd.Parameters.AddWithValue("@JORNI_JOJWI_SVOI_Number", isJWIRow ? (item.JORNI_JOJWI_SVOI_Number ?? 0) : 0);
                                cmd.Parameters.AddWithValue("@JORNI_IsFreightApplicable", item.JORNI_IsFreightApplicable ?? "No");
                                cmd.Parameters.AddWithValue("@JORNI_FromWH_Number", isFreightRow ? (item.JORNI_FromWH_Number ?? 0) : 0);
                                cmd.Parameters.AddWithValue("@JORNI_ToWH_Number", isFreightRow ? (item.JORNI_ToWH_Number ?? 0) : 0);
                                cmd.Parameters.AddWithValue("@JORNI_JOFRT_SVOH_Number", isFreightRow ? (item.JORNI_JOFRT_SVOH_Number ?? 0) : 0);
                                cmd.Parameters.AddWithValue("@JORNI_JOFRT_SVOI_Number", isFreightRow ? (item.JORNI_JOFRT_SVOI_Number ?? 0) : 0);

                                insertedItemNumber = Convert.ToInt64(cmd.ExecuteScalar());
                            }

                            insertedItems.Add(new ItemMapDTO
                            {
                                ItemNumber = insertedItemNumber,
                                ItemMasterNumber = item.JORNI_Item_Number,
                                Qty = Convert.ToDecimal(item.JORNI_Qty)
                            });
                        }

                        // ---------------- BATCHES (flat list split item by item, same as DN) ----------------
                        List<StockBatchWork> work = RN_DTO.receiptNoteBatches.Select(b => new StockBatchWork
                        {
                            RefBatch = b.JORNI_BCH_Ref_Batch,
                            WH = b.JORNI_BCH_WH_Number,
                            BatchDate = b.JORNI_BCH_BatchDate,
                            BatchNo = b.JORNI_BCH_BatchNo,
                            Qty = b.JORNI_BCH_BatchQty,
                            UnitPrice = b.JORNI_BCH_BatchUnitPrice
                        }).ToList();

                        int batchIndex = 0;

                        foreach (var item in insertedItems)
                        {
                            decimal balanceQty = item.Qty;

                            while (balanceQty > 0 && batchIndex < work.Count)
                            {
                                var batch = work[batchIndex];
                                decimal useQty;

                                if (batch.Qty <= balanceQty)
                                {
                                    useQty = batch.Qty;
                                    batchIndex++;
                                }
                                else
                                {
                                    useQty = balanceQty;
                                    batch.Qty -= balanceQty;
                                }

                                decimal useValue = Math.Round(useQty * batch.UnitPrice, 2);
                                long batchNumber = 0;

                                // JO_ReceiptNoteBatch
                                using (SqlCommand cmd = new SqlCommand(@"
                                    INSERT INTO JO_ReceiptNoteBatch
                                    (
                                        JORNI_BCH_JORNH_Number, JORNI_BCH_JORNI_Number, JORNI_BCH_WH_Number,
                                        JORNI_BCH_BatchDate, JORNI_BCH_BatchNo, JORNI_BCH_BatchQty,
                                        JORNI_BCH_BatchUnitPrice, JORNI_BCH_BatchValue, JORNI_BCH_Ref_Batch
                                    )
                                    OUTPUT INSERTED.JORNI_BCH_Number
                                    VALUES
                                    (
                                        @JORNH, @JORNI, @WH, @BatchDate, @BatchNo, @Qty, @UnitPrice, @BatchValue, @RefBatch
                                    )", con, tr))
                                {
                                    cmd.Parameters.AddWithValue("@JORNH", RN_Number);
                                    cmd.Parameters.AddWithValue("@JORNI", item.ItemNumber);
                                    cmd.Parameters.AddWithValue("@WH", batch.WH);
                                    cmd.Parameters.AddWithValue("@BatchDate", batch.BatchDate);
                                    cmd.Parameters.AddWithValue("@BatchNo", batch.BatchNo);
                                    cmd.Parameters.AddWithValue("@Qty", (double)useQty);
                                    cmd.Parameters.AddWithValue("@UnitPrice", (double)batch.UnitPrice);
                                    cmd.Parameters.AddWithValue("@BatchValue", (double)useValue);
                                    cmd.Parameters.AddWithValue("@RefBatch", batch.RefBatch);

                                    batchNumber = Convert.ToInt64(cmd.ExecuteScalar());
                                }

                                // IN_COMMON_BATCH  (LineBatch_Number = this receipt batch number)
                                using (SqlCommand cmd = new SqlCommand(@"
                                    INSERT INTO IN_COMMON_BATCH
                                    (
                                        ICB_TransType, ICB_TransDate, ICB_Header_Number, ICB_LineItem_Number,
                                        ICB_Item_Number, ICB_LineBatch_Number, ICB_Warehouse_Number,
                                        ICB_BatchDate, ICB_BatchNo, ICB_ItemStatus,
                                        ICB_BatchQty, ICB_BatchUnitPrice, ICB_BatchValue, ICB_RefBatch_Number,
                                        ICB_CreatorCode, ICB_CreatorDate, ICB_EditorCode, ICB_EditorDate
                                    )
                                    VALUES
                                    (
                                        @TransType, @TransDate, @Header_Number, @LineItem_Number,
                                        @Item_Number, @LineBatch_Number, @Warehouse,
                                        @BatchDate, @BatchNo, @ItemStatus,
                                        @BatchQty, @BatchUnitPrice, @BatchValue, 0,
                                        0, GETDATE(), 0, GETDATE()
                                    )", con, tr))
                                {
                                    cmd.Parameters.AddWithValue("@TransType", "JO Receipt Note");
                                    cmd.Parameters.AddWithValue("@TransDate", h.JORNH_RN_Date);
                                    cmd.Parameters.AddWithValue("@Header_Number", RN_Number);
                                    cmd.Parameters.AddWithValue("@LineItem_Number", item.ItemNumber);
                                    cmd.Parameters.AddWithValue("@Item_Number", item.ItemMasterNumber);
                                    cmd.Parameters.AddWithValue("@LineBatch_Number", batchNumber);
                                    cmd.Parameters.AddWithValue("@Warehouse", batch.WH);
                                    cmd.Parameters.AddWithValue("@BatchDate", batch.BatchDate);
                                    cmd.Parameters.AddWithValue("@BatchNo", batch.BatchNo);
                                    cmd.Parameters.AddWithValue("@ItemStatus", "Good");
                                    cmd.Parameters.AddWithValue("@BatchQty", (double)useQty);
                                    cmd.Parameters.AddWithValue("@BatchUnitPrice", (double)batch.UnitPrice);
                                    cmd.Parameters.AddWithValue("@BatchValue", (double)useValue);
                                    cmd.ExecuteNonQuery();
                                }

                                // JO_OUT_COMMON_BATCH (source JO IN batch consumed; RefBatch = LineBatch = source batch)
                                using (SqlCommand cmd = new SqlCommand(@"
                                    INSERT INTO dbo.JO_OUT_COMMON_BATCH
                                    (
                                        JOOCB_TransType, JOOCB_TransDate, JOOCB_Header_Number, JOOCB_LineItem_Number,
                                        JOOCB_LineBatch_Number, JOOCB_Warehouse_Number, JOOCB_BatchDate, JOOCB_BatchNo,
                                        JOOCB_ItemStatus, JOOCB_BatchQty, JOOCB_BatchUnitPrice, JOOCB_BatchValue,
                                        JOOCB_RefBatch_Number, JOOCB_Item_Number, JOOCB_CreatorCode, JOOCB_CreatorDate
                                    )
                                    VALUES
                                    (
                                        @TransType, @TransDate, @Header_Number, @LineItem_Number,
                                        @SrcBatch, @Warehouse, @BatchDate, @BatchNo,
                                        'Good', @BatchQty, @BatchUnitPrice, @BatchValue,
                                        @SrcBatch, @Item_Number, 0, GETDATE()
                                    )", con, tr))
                                {
                                    cmd.Parameters.AddWithValue("@TransType", "JO Receipt Note");
                                    cmd.Parameters.AddWithValue("@TransDate", h.JORNH_RN_Date);
                                    cmd.Parameters.AddWithValue("@Header_Number", RN_Number);
                                    cmd.Parameters.AddWithValue("@LineItem_Number", item.ItemNumber);
                                    cmd.Parameters.AddWithValue("@SrcBatch", batch.RefBatch);
                                    cmd.Parameters.AddWithValue("@Warehouse", batch.WH);
                                    cmd.Parameters.AddWithValue("@BatchDate", batch.BatchDate);
                                    cmd.Parameters.AddWithValue("@BatchNo", batch.BatchNo);
                                    cmd.Parameters.AddWithValue("@BatchQty", (double)useQty);
                                    cmd.Parameters.AddWithValue("@BatchUnitPrice", (double)batch.UnitPrice);
                                    cmd.Parameters.AddWithValue("@BatchValue", (double)useValue);
                                    cmd.Parameters.AddWithValue("@Item_Number", item.ItemMasterNumber);
                                    cmd.ExecuteNonQuery();
                                }

                                balanceQty -= useQty;
                            }

                            if (balanceQty > 0)
                                throw new Exception("Batch qty is less than item qty. Please check the batch details.");
                        }

                        // ---------------- CLEAR TEMP ----------------
                        using (SqlCommand cmd = new SqlCommand("DELETE FROM temp_JO_ReceiptNoteBatch", con, tr))
                        {
                            cmd.ExecuteNonQuery();
                        }

                        tr.Commit();
                        return RN_Number;
                    }
                    catch
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }
        }
        #endregion

        #region Update (one transaction)
        public void JO_ReceiptNoteUpdateDB(JO_ReceiptNoteCreate_DTO RN_DTO)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        JO_ReceiptNoteHeaderUpdate(RN_DTO, con, tr);
                        JO_ReceiptNoteItemBulkUpdate(RN_DTO, con, tr);
                        JO_ReceiptNoteBatchBulkUpdate(RN_DTO.Header.JORNH_Number, con, tr);

                        tr.Commit();
                    }
                    catch (Exception)
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }
        }

        public void JO_ReceiptNoteHeaderUpdate(JO_ReceiptNoteCreate_DTO RN_DTO, SqlConnection con, SqlTransaction tr)
        {
            using (SqlCommand cmd = new SqlCommand("JO_ReceiptNoteHead_Update_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                var h = RN_DTO.Header;

                cmd.Parameters.AddWithValue("@JORNH_Number", h.JORNH_Number);
                cmd.Parameters.AddWithValue("@JORNH_RN_No", h.JORNH_RN_No);
                cmd.Parameters.AddWithValue("@JORNH_RN_Date", h.JORNH_RN_Date);
                cmd.Parameters.AddWithValue("@JORNH_VendorDC_No", h.JORNH_VendorDC_No ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JORNH_VendorDC_Date", h.JORNH_VendorDC_Date);
                cmd.Parameters.AddWithValue("@JORNH_MS_Number", h.JORNH_MS_Number);
                cmd.Parameters.AddWithValue("@JORNH_JW_Vendor_Number", h.JORNH_JW_Vendor_Number);
                cmd.Parameters.AddWithValue("@JORNH_Currency_Number", h.JORNH_Currency_Number);
                cmd.Parameters.AddWithValue("@JORNH_WH_Number", h.JORNH_WH_Number);
                cmd.Parameters.AddWithValue("@JORNH_Remarks", h.JORNH_Remarks ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JORNH_IsFreightApplicable", h.JORNH_IsFreightApplicable ?? "No");

                cmd.ExecuteNonQuery();
            }
        }

        public void JO_ReceiptNoteItemBulkUpdate(JO_ReceiptNoteCreate_DTO RN_DTO, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JORNI_JORNH_Number", typeof(long));
            dt.Columns.Add("JORNI_Number", typeof(long));
            dt.Columns.Add("JORNI_JPRS_Number", typeof(long));
            dt.Columns.Add("JORNI_Item_Number", typeof(long));
            dt.Columns.Add("JORNI_WH_Number", typeof(long));
            dt.Columns.Add("JORNI_UoM_Number", typeof(long));
            dt.Columns.Add("JORNI_Qty", typeof(double));
            dt.Columns.Add("JORNI_Qty_Kgs", typeof(double));
            dt.Columns.Add("JORNI_UnitPrice", typeof(double));
            dt.Columns.Add("JORNI_Amount", typeof(double));
            dt.Columns.Add("JORNI_IsJW_InvoiceApplicable", typeof(string));
            dt.Columns.Add("JORNI_JOJWI_SVOH_Number", typeof(long));
            dt.Columns.Add("JORNI_JOJWI_SVOI_Number", typeof(long));
            dt.Columns.Add("JORNI_IsFreightApplicable", typeof(string));
            dt.Columns.Add("JORNI_FromWH_Number", typeof(long));
            dt.Columns.Add("JORNI_ToWH_Number", typeof(long));
            dt.Columns.Add("JORNI_JOFRT_SVOH_Number", typeof(long));
            dt.Columns.Add("JORNI_JOFRT_SVOI_Number", typeof(long));

            foreach (var item in RN_DTO.Items)
            {
                bool isJWIRow = item.JORNI_IsJW_InvoiceApplicable == "Yes";
                bool isFreightRow = item.JORNI_IsFreightApplicable == "Yes";

                dt.Rows.Add(
                    RN_DTO.Header.JORNH_Number,
                    item.JORNI_Number,
                    item.JORNI_JPRS_Number,
                    item.JORNI_Item_Number,
                    item.JORNI_WH_Number,
                    item.JORNI_UoM_Number,
                    item.JORNI_Qty,
                    item.JORNI_Qty_Kgs,
                    item.JORNI_UnitPrice,
                    item.JORNI_Amount,
                    item.JORNI_IsJW_InvoiceApplicable ?? "No",
                    isJWIRow ? (item.JORNI_JOJWI_SVOH_Number ?? 0) : 0,
                    isJWIRow ? (item.JORNI_JOJWI_SVOI_Number ?? 0) : 0,
                    item.JORNI_IsFreightApplicable ?? "No",
                    isFreightRow ? (item.JORNI_FromWH_Number ?? 0) : 0,
                    isFreightRow ? (item.JORNI_ToWH_Number ?? 0) : 0,
                    isFreightRow ? (item.JORNI_JOFRT_SVOH_Number ?? 0) : 0,
                    isFreightRow ? (item.JORNI_JOFRT_SVOI_Number ?? 0) : 0
                );
            }

            using (SqlCommand cmd = new SqlCommand("JO_ReceiptNoteItem_BulkUpdate_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
                param.SqlDbType = SqlDbType.Structured;
                param.TypeName = "JO_ReceiptNoteItemUpdateType";

                cmd.ExecuteNonQuery();
            }
        }

        public void JO_ReceiptNoteBatchBulkUpdate(long JORNH_Number, SqlConnection con, SqlTransaction tr)
        {
            using (SqlCommand cmd = new SqlCommand("JO_ReceiptNoteBatch_BulkUpdate_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@JORNH_Number", JORNH_Number);
                cmd.ExecuteNonQuery();
            }
        }
        #endregion

        #region Delete removed rows (Edit page)
        public void DeleteRemovedRowsDB(List<JO_ReceiptNoteDeletedRow_DTO> deletedRows)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        foreach (var item in deletedRows)
                        {
                            // used batch -> row cannot be deleted
                            using (SqlCommand chk = new SqlCommand(@"
                                SELECT COUNT(*)
                                FROM JO_ReceiptNoteBatch B
                                INNER JOIN OUT_COMMON_BATCH O ON O.OCB_RefBatch_Number = B.JORNI_BCH_Number
                                WHERE B.JORNI_BCH_JORNI_Number = @JORNI_Number
                                  AND B.JORNI_BCH_JORNH_Number = @JORNH_Number", con, tr))
                            {
                                chk.Parameters.AddWithValue("@JORNI_Number", item.JORNI_Number);
                                chk.Parameters.AddWithValue("@JORNH_Number", item.JORNH_Number);

                                if (Convert.ToInt32(chk.ExecuteScalar()) > 0)
                                    throw new Exception("This row has used qty. It cannot be deleted.");
                            }

                            // invoiced row -> cannot be deleted
                            using (SqlCommand chkInv = new SqlCommand(@"
                                SELECT COUNT(*)
                                FROM JO_JobworkInvoiceItem
                                WHERE JOSVII_JORNH_Number = @JORNH_Number
                                  AND JOSVII_JORNI_Number = @JORNI_Number", con, tr))
                            {
                                chkInv.Parameters.AddWithValue("@JORNI_Number", item.JORNI_Number);
                                chkInv.Parameters.AddWithValue("@JORNH_Number", item.JORNH_Number);

                                if (Convert.ToInt32(chkInv.ExecuteScalar()) > 0)
                                    throw new Exception("This row has invoiced qty. It cannot be deleted.");
                            }

                            // IN_COMMON_BATCH rows of this line
                            using (SqlCommand cmd = new SqlCommand(@"
                                DELETE FROM IN_COMMON_BATCH
                                WHERE ICB_TransType = 'JO Receipt Note'
                                  AND ICB_Header_Number = @JORNH_Number
                                  AND ICB_LineItem_Number = @JORNI_Number
                                  AND @JORNI_Number > 0", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@JORNI_Number", item.JORNI_Number);
                                cmd.Parameters.AddWithValue("@JORNH_Number", item.JORNH_Number);
                                cmd.ExecuteNonQuery();
                            }

                            // batch rows
                            using (SqlCommand cmd = new SqlCommand(@"
                                DELETE FROM JO_ReceiptNoteBatch
                                WHERE JORNI_BCH_JORNI_Number = @JORNI_Number
                                  AND JORNI_BCH_JORNH_Number = @JORNH_Number", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@JORNI_Number", item.JORNI_Number);
                                cmd.Parameters.AddWithValue("@JORNH_Number", item.JORNH_Number);
                                cmd.ExecuteNonQuery();
                            }

                            // item row
                            using (SqlCommand cmd = new SqlCommand(@"
                                DELETE FROM JO_ReceiptNoteItem
                                WHERE JORNI_Number = @JORNI_Number
                                  AND JORNI_JORNH_Number = @JORNH_Number", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@JORNI_Number", item.JORNI_Number);
                                cmd.Parameters.AddWithValue("@JORNH_Number", item.JORNH_Number);
                                cmd.ExecuteNonQuery();
                            }

                            // temp rows of this line
                            using (SqlCommand cmd = new SqlCommand(@"
                                DELETE FROM temp_JO_ReceiptNoteBatch
                                WHERE JORNI_NUMBER = @JORNI_Number AND JORNH_NUMBER = @JORNH_Number", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@JORNI_Number", item.JORNI_Number);
                                cmd.Parameters.AddWithValue("@JORNH_Number", item.JORNH_Number);
                                cmd.ExecuteNonQuery();
                            }
                        }

                        tr.Commit();
                    }
                    catch
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }
        }
        #endregion

        #region JW Invoice SO / Freight SO
        public DataSet GetServiceOrderDB(long vendorId, long? jprsNumber = null, long? itemNumber = null,
                                         long? uomNumber = null, long excludeJORNH = 0)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JOJWI_ServiceOrder_GetByVendor_RN_SP");

                db.AddInParameter(cmd, "@VendorId", DbType.Int64, vendorId);
                db.AddInParameter(cmd, "@JPRS_Number", DbType.Int64, jprsNumber.HasValue ? (object)jprsNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@Item_Number", DbType.Int64, itemNumber.HasValue ? (object)itemNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@UoM_Number", DbType.Int64, uomNumber.HasValue ? (object)uomNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@Exclude_JORNH_Number", DbType.Int64, excludeJORNH);

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JOJWI_ServiceOrder_GetByVendor_RN_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        public DataSet GetFreightServiceOrderDB(long vendorId, long? uomNumber = null, long? fromWHNumber = null,
                                                long? toWHNumber = null, long excludeJORNH = 0,
                                                string category = "RECEIPT NOTE")
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JOFRT_ServiceOrder_GetByVendor_RN_SP");

                db.AddInParameter(cmd, "@VendorId", DbType.Int64, vendorId);
                db.AddInParameter(cmd, "@UoM_Number", DbType.Int64, uomNumber.HasValue ? (object)uomNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64, fromWHNumber.HasValue ? (object)fromWHNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64, toWHNumber.HasValue ? (object)toWHNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@Exclude_JORNH_Number", DbType.Int64, excludeJORNH);
                db.AddInParameter(cmd, "@Category", DbType.String, category ?? "RECEIPT NOTE");

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JOFRT_ServiceOrder_GetByVendor_RN_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        public DataSet CheckReceivedQtyExceededJWIDB(long jojwiSvohNumber, long? jprsNumber = null, long? itemNumber = null,
                                                     long? uomNumber = null, long excludeJORNH = 0)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_CheckReceivedQtyExceeded_JWI_SP");

                db.AddInParameter(cmd, "@JOJWI_SVOH_Number", DbType.Int64, jojwiSvohNumber);
                db.AddInParameter(cmd, "@JPRS_Number", DbType.Int64, jprsNumber.HasValue ? (object)jprsNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@Item_Number", DbType.Int64, itemNumber.HasValue ? (object)itemNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@UoM_Number", DbType.Int64, uomNumber.HasValue ? (object)uomNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@Exclude_JORNH_Number", DbType.Int64, excludeJORNH);

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_CheckReceivedQtyExceeded_JWI_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        public DataSet CheckReceivedQtyExceededFreightDB(long jofrtSvohNumber, long? uomNumber = null,
                                                         long? fromWHNumber = null, long? toWHNumber = null,
                                                         long excludeJORNH = 0)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_CheckReceivedQtyExceeded_Freight_SP");

                db.AddInParameter(cmd, "@JOFRT_SVOH_Number", DbType.Int64, jofrtSvohNumber);
                db.AddInParameter(cmd, "@UoM_Number", DbType.Int64, uomNumber.HasValue ? (object)uomNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64, fromWHNumber.HasValue ? (object)fromWHNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64, toWHNumber.HasValue ? (object)toWHNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@Exclude_JORNH_Number", DbType.Int64, excludeJORNH);

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_CheckReceivedQtyExceeded_Freight_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }
        #endregion
    }

    public class JO_RN_BatchQtyValidationDto
    {
        public int DBCH_Index { get; set; }
        public decimal DBCH_Qty { get; set; }
    }
}