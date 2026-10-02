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
    public class JO_DeliveryNote_DAO
    {
        DBConnect DB = new DBConnect();

        // Freight process number (JO_Process.JPRS_Number)
        private const long FREIGHT_PRS_NUMBER = 40008;

        // OUT_COMMON_BATCH trans type for this module
        private const string TRANS_TYPE = "JO Delivery Note";

        #region Delivery Note Address Edit

        public DataSet DeliveryNoteAddressEditDB(long JODNA_JODNH_Number, int JODNA_ADTP_Number)
        {
            DataSet ds = new DataSet();

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    SELECT DISTINCT
                        A.JODNA_Number     AS JWV_ADD_Number,
                        A.JODNA_Address_ID AS JWV_ADD_Address_ID
                    FROM JODNA_Address A
                    WHERE A.JODNA_JODNH_Number = @JODNH_Number
                      AND A.JODNA_ADTP_Number = @ADTP_Number;

                    SELECT
                        A.JODNA_Number      AS JWV_ADD_Number,
                        A.JODNA_ADTP_Number AS JWV_ADD_ADTP_Number,
                        A.JODNA_Address_ID  AS JWV_ADD_Address_ID,
                        A.JODNA_Address     AS JWV_ADD_Address,
                        A.JODNA_City        AS JWV_ADD_City,
                        A.JODNA_State       AS JWV_ADD_State,
                        A.JODNA_Country     AS JWV_ADD_Country,
                        A.JODNA_PIN         AS JWV_ADD_PIN,
                        A.JODNA_GSTIN       AS JWV_ADD_GSTIN
                    FROM JODNA_Address A
                    WHERE A.JODNA_JODNH_Number = @JODNH_Number
                      AND A.JODNA_ADTP_Number = @ADTP_Number;", con))
                {
                    cmd.Parameters.AddWithValue("@JODNH_Number", JODNA_JODNH_Number);
                    cmd.Parameters.AddWithValue("@ADTP_Number", JODNA_ADTP_Number);

                    using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    {
                        da.Fill(ds);
                    }
                }
            }

            return ds;
        }

        #endregion

        #region Get (Edit / View / Master / Summary)

        public DataSet DeliveryNoteEditDB(long JODNH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_Edit_SP");

            db.AddInParameter(cmd, "@JODNH_Number", DbType.Int64, JODNH_Number);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet DeliveryNoteViewDB(long JODNH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_View_SP");

            db.AddInParameter(cmd, "@JODNH_Number", DbType.Int64, JODNH_Number);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet DeliveryNoteDB(JO_DeliveryNoteCreate_DTO DN_DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_SP");

            db.AddInParameter(cmd, "@DN_Id", DbType.Int32, DN_DTO.Header.DN_Id);

            // callers that do not set a date (e.g. address lookups) send 0001-01-01 -> SqlDateTime overflow
            DateTime dnDate = DN_DTO.Header.JODNH_DN_Date == DateTime.MinValue
                ? DateTime.Now
                : DN_DTO.Header.JODNH_DN_Date;

            db.AddInParameter(cmd, "@JODNH_DN_Date", DbType.Date, dnDate);
            db.AddInParameter(cmd, "@JODNI_Item_Code", DbType.String, DN_DTO.Header.JODNI_Item_Code);
            db.AddInParameter(cmd, "@DN_JWV_Number", DbType.Int64, DN_DTO.Header.DN_JWV_Number);
            db.AddInParameter(cmd, "@DN_ADD_ADTP_Number", DbType.Int64, DN_DTO.Header.DN_ADD_ADTP_Number);
            db.AddInParameter(cmd, "@DN_ADD_Addressid", DbType.String, DN_DTO.Header.DN_ADD_Addressid);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet DeliveryNoteSummaryDB(JO_DeliveryNoteSummary_DTO DN_DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_Summary_SP");

            db.AddInParameter(cmd, "@DN_Id", DbType.Int32, DN_DTO.DN_Id);

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region Temp batch table helpers

        public bool IsTempDeliveryBatchEmpty()
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlCommand cmd = new SqlCommand(@"SELECT * FROM Temp_JO_DeliveryNoteBatch", con))
                {
                    using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    {
                        DataTable dtTempBatch = new DataTable();
                        da.Fill(dtTempBatch);
                        return dtTempBatch.Rows.Count == 0;
                    }
                }
            }
        }

        public void DeleteTempDeliveryNoteBatch()
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        using (SqlCommand cmd = new SqlCommand(@"DELETE FROM Temp_JO_DeliveryNoteBatch", con, tr))
                        {
                            cmd.ExecuteNonQuery();
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

        #region Freight SO item resolve

        // Resolves JOFRT_SVOI_Number for a freight row (when the page did not send it)
        private long ResolveFreightSVOI(JO_DeliveryNoteItem_DTO item, SqlConnection con, SqlTransaction tr)
        {
            if ((item.JODNI_JOFRT_SVOI_Number ?? 0) > 0)
                return item.JODNI_JOFRT_SVOI_Number.Value;

            if ((item.JODNI_JOFRT_SVOH_Number ?? 0) == 0)
                return 0;

            using (SqlCommand cmd = new SqlCommand(@"
                SELECT TOP 1 JOFRT_SVOI_Number
                FROM JOFRT_ServiceOrderItem
                WHERE JOFRT_SVOI_SVOH_Number = @SVOH_Number
                  AND JOFRT_SVOI_JPRS_Number = @PRS_Number
                  AND JOFRT_SVOI_UoM_Number = @UoM_Number
                  AND (@FromWH IS NULL OR JOFRT_SVOI_FromWH_Number = @FromWH)
                  AND (@ToWH IS NULL OR JOFRT_SVOI_ToWH_Number = @ToWH)", con, tr))
            {
                cmd.Parameters.AddWithValue("@SVOH_Number", item.JODNI_JOFRT_SVOH_Number.Value);
                cmd.Parameters.AddWithValue("@PRS_Number", FREIGHT_PRS_NUMBER);
                cmd.Parameters.AddWithValue("@UoM_Number", item.JODNI_UoM_Number);
                cmd.Parameters.AddWithValue("@FromWH", item.JODNI_FromWH_Number.HasValue ? (object)item.JODNI_FromWH_Number.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@ToWH", item.JODNI_ToWH_Number.HasValue ? (object)item.JODNI_ToWH_Number.Value : DBNull.Value);

                object result = cmd.ExecuteScalar();

                return (result != null && result != DBNull.Value) ? Convert.ToInt64(result) : 0;
            }
        }

        #endregion

        #region update deliverynote

        public void DeliveryNoteUpdateDB(JO_DeliveryNoteCreate_DTO DN_DTO)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        DeliveryNoteHeaderUpdate(DN_DTO, con, tr);
                        DeliveryNoteItemBulkUpdate(DN_DTO, con, tr);
                        DeliveryNoteBatchBulkUpdate(DN_DTO.Header.JODNH_Number, con, tr);

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

        public void DeliveryNoteBatchBulkUpdate(long JODNH_Number, SqlConnection con, SqlTransaction tr)
        {
            using (SqlCommand cmd = new SqlCommand("JO_DeliveryNoteBatch_BulkUpdate_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@JODNH_Number", JODNH_Number);
                cmd.ExecuteNonQuery();
            }
        }

        public void DeliveryNoteHeaderUpdate(JO_DeliveryNoteCreate_DTO DN_DTO, SqlConnection con, SqlTransaction tr)
        {
            using (SqlCommand cmd = new SqlCommand("JO_DeliveryNoteHead_Update_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                var h = DN_DTO.Header;

                cmd.Parameters.AddWithValue("@JODNH_Number", h.JODNH_Number);
                cmd.Parameters.AddWithValue("@JODNH_DN_No", h.JODNH_DN_No);
                cmd.Parameters.AddWithValue("@JODNH_DN_Date", h.JODNH_DN_Date);
                cmd.Parameters.AddWithValue("@JODNH_MS_Number", h.JODNH_MS_Number);
                cmd.Parameters.AddWithValue("@JODNH_JW_Vendor_Number", h.JODNH_JW_Vendor_Number);
                cmd.Parameters.AddWithValue("@JODNH_Currency_Number", h.JODNH_Currency_Number);
                cmd.Parameters.AddWithValue("@JODNH_WH_Number", h.JODNH_WH_Number);
                cmd.Parameters.AddWithValue("@JODNH_IsFreightApplicable", h.JODNH_IsFreightApplicable ?? "No");
                cmd.Parameters.AddWithValue("@JODNH_PaymentTerms", h.JODNH_PaymentTerms ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JODNH_DeliveryTerms", h.JODNH_DeliveryTerms ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JODNH_DeliveryMode", h.JODNH_DeliveryMode ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JODNH_DespatchDocumentNo", h.JODNH_DespatchDocumentNo ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JODNH_DespatchedThrough", h.JODNH_DespatchedThrough ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JODNH_Remarks", h.JODNH_Remarks ?? (object)DBNull.Value);

                cmd.ExecuteNonQuery();
            }
        }

        public void DeliveryNoteItemBulkUpdate(JO_DeliveryNoteCreate_DTO DN_DTO, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JODNI_Number", typeof(long));
            dt.Columns.Add("JODNI_JODNH_Number", typeof(long));
            dt.Columns.Add("JODNI_JPRS_Number", typeof(long));
            dt.Columns.Add("JODNI_Item_Number", typeof(long));
            dt.Columns.Add("JODNI_WH_Number", typeof(long));
            dt.Columns.Add("JODNI_UoM_Number", typeof(long));
            dt.Columns.Add("JODNI_Qty", typeof(double));
            dt.Columns.Add("JODNI_UnitPrice", typeof(double));
            dt.Columns.Add("JODNI_Amount", typeof(double));
            dt.Columns.Add("JODNI_IsFreightApplicable", typeof(string));
            dt.Columns.Add("JODNI_FromWH_Number", typeof(long));
            dt.Columns.Add("JODNI_ToWH_Number", typeof(long));
            dt.Columns.Add("JODNI_JOFRT_SVOH_Number", typeof(long));
            dt.Columns.Add("JODNI_JOFRT_SVOI_Number", typeof(long));

            foreach (var item in DN_DTO.Items)
            {
                bool isFreightRow = item.JODNI_IsFreightApplicable == "Yes";
                long svoi = isFreightRow ? ResolveFreightSVOI(item, con, tr) : 0;

                dt.Rows.Add(
                    item.JODNI_Number,
                    DN_DTO.Header.JODNH_Number,
                    item.JODNI_JPRS_Number,
                    item.JODNI_Item_Number,
                    item.JODNI_WH_Number,
                    item.JODNI_UoM_Number,
                    item.JODNI_Qty,
                    item.JODNI_UnitPrice,
                    item.JODNI_Amount,
                    item.JODNI_IsFreightApplicable ?? "No",
                    item.JODNI_FromWH_Number ?? 0,
                    item.JODNI_ToWH_Number ?? 0,
                    isFreightRow ? (item.JODNI_JOFRT_SVOH_Number ?? 0) : 0,
                    svoi
                );
            }

            using (SqlCommand cmd = new SqlCommand("JO_DeliveryNoteItem_BulkUpdate_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
                param.SqlDbType = SqlDbType.Structured;
                param.TypeName = "JO_DeliveryNoteItemUpdateType";

                cmd.ExecuteNonQuery();
            }
        }

        #endregion

        #region create deliverynote

        public DataSet DeliveryNoteCreateDB(JO_DeliveryNoteCreate_DTO DN_DTO)
        {
            DataSet ds = new DataSet();

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        //-------------------------------------------------
                        // HEADER INSERT
                        //-------------------------------------------------

                        long DN_Number = 0;

                        using (SqlCommand cmd = new SqlCommand(@"
                    INSERT INTO JO_DeliveryNoteHead
                    (
                        JODNH_DN_No,
                        JODNH_DN_Date,
                        JODNH_MS_Number,
                        JODNH_JW_Vendor_Number,
                        JODNH_Currency_Number,
                        JODNH_WH_Number,
                        JODNH_IsFreightApplicable,
                        JODNH_PaymentTerms,
                        JODNH_DeliveryTerms,
                        JODNH_DeliveryMode,
                        JODNH_DespatchDocumentNo,
                        JODNH_DespatchedThrough,
                        JODNH_Remarks
                    )

                    OUTPUT INSERTED.JODNH_Number

                    VALUES
                    (
                        @JODNH_DN_No,
                        @JODNH_DN_Date,
                        @JODNH_MS_Number,
                        @JODNH_JW_Vendor_Number,
                        @JODNH_Currency_Number,
                        @JODNH_WH_Number,
                        @JODNH_IsFreightApplicable,
                        @JODNH_PaymentTerms,
                        @JODNH_DeliveryTerms,
                        @JODNH_DeliveryMode,
                        @JODNH_DespatchDocumentNo,
                        @JODNH_DespatchedThrough,
                        @JODNH_Remarks
                    )", con, tr))
                        {
                            var h = DN_DTO.Header;

                            cmd.Parameters.AddWithValue("@JODNH_DN_No", h.JODNH_DN_No);
                            cmd.Parameters.AddWithValue("@JODNH_DN_Date", h.JODNH_DN_Date);
                            cmd.Parameters.AddWithValue("@JODNH_MS_Number", h.JODNH_MS_Number);
                            cmd.Parameters.AddWithValue("@JODNH_JW_Vendor_Number", h.JODNH_JW_Vendor_Number);
                            cmd.Parameters.AddWithValue("@JODNH_Currency_Number", h.JODNH_Currency_Number);
                            cmd.Parameters.AddWithValue("@JODNH_WH_Number", h.JODNH_WH_Number);
                            cmd.Parameters.AddWithValue("@JODNH_IsFreightApplicable", h.JODNH_IsFreightApplicable ?? "No");
                            cmd.Parameters.AddWithValue("@JODNH_PaymentTerms", h.JODNH_PaymentTerms ?? "");
                            cmd.Parameters.AddWithValue("@JODNH_DeliveryTerms", h.JODNH_DeliveryTerms ?? "");
                            cmd.Parameters.AddWithValue("@JODNH_DeliveryMode", h.JODNH_DeliveryMode ?? "");
                            cmd.Parameters.AddWithValue("@JODNH_DespatchDocumentNo", h.JODNH_DespatchDocumentNo ?? "");
                            cmd.Parameters.AddWithValue("@JODNH_DespatchedThrough", h.JODNH_DespatchedThrough ?? "");
                            cmd.Parameters.AddWithValue("@JODNH_Remarks", h.JODNH_Remarks ?? "");

                            DN_Number = Convert.ToInt64(cmd.ExecuteScalar());
                        }

                        //-------------------------------------------------
                        // ITEM INSERT
                        //-------------------------------------------------

                        List<ItemMapDTO> insertedItems = new List<ItemMapDTO>();

                        foreach (var item in DN_DTO.Items)
                        {
                            long insertedItemNumber = 0;

                            bool isFreightRow = item.JODNI_IsFreightApplicable == "Yes";

                            long svohFrt = isFreightRow ? (item.JODNI_JOFRT_SVOH_Number ?? 0) : 0;
                            long svoiFrt = isFreightRow ? ResolveFreightSVOI(item, con, tr) : 0;

                            using (SqlCommand cmd = new SqlCommand(@"
        INSERT INTO JO_DeliveryNoteItem
        (
            JODNI_JODNH_Number,
            JODNI_JPRS_Number,
            JODNI_Item_Number,
            JODNI_WH_Number,
            JODNI_UoM_Number,
            JODNI_Qty,
            JODNI_Qty_Kgs,
            JODNI_UnitPrice,
            JODNI_Amount,
            JODNI_IsFreightApplicable,
            JODNI_FromWH_Number,
            JODNI_ToWH_Number,
            JODNI_JOFRT_SVOH_Number,
            JODNI_JOFRT_SVOI_Number
        )
        OUTPUT INSERTED.JODNI_Number
        VALUES
        (
            @JODNI_JODNH_Number,
            @JODNI_JPRS_Number,
            @JODNI_Item_Number,
            @JODNI_WH_Number,
            @JODNI_UoM_Number,
            @JODNI_Qty,
            @JODNI_Qty_Kgs,
            @JODNI_UnitPrice,
            @JODNI_Amount,
            @JODNI_IsFreightApplicable,
            @JODNI_FromWH_Number,
            @JODNI_ToWH_Number,
            @JODNI_JOFRT_SVOH_Number,
            @JODNI_JOFRT_SVOI_Number
        )", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@JODNI_JODNH_Number", DN_Number);
                                cmd.Parameters.AddWithValue("@JODNI_JPRS_Number", item.JODNI_JPRS_Number);
                                cmd.Parameters.AddWithValue("@JODNI_Item_Number", item.JODNI_Item_Number);
                                cmd.Parameters.AddWithValue("@JODNI_WH_Number", item.JODNI_WH_Number);
                                cmd.Parameters.AddWithValue("@JODNI_UoM_Number", item.JODNI_UoM_Number);
                                cmd.Parameters.AddWithValue("@JODNI_Qty", item.JODNI_Qty);
                                cmd.Parameters.AddWithValue("@JODNI_Qty_Kgs", item.JODNI_Qty_Kgs);
                                cmd.Parameters.AddWithValue("@JODNI_UnitPrice", item.JODNI_UnitPrice);
                                cmd.Parameters.AddWithValue("@JODNI_Amount", item.JODNI_Amount);
                                cmd.Parameters.AddWithValue("@JODNI_IsFreightApplicable", item.JODNI_IsFreightApplicable ?? "No");
                                cmd.Parameters.AddWithValue("@JODNI_FromWH_Number", item.JODNI_FromWH_Number ?? 0);
                                cmd.Parameters.AddWithValue("@JODNI_ToWH_Number", item.JODNI_ToWH_Number ?? 0);
                                cmd.Parameters.AddWithValue("@JODNI_JOFRT_SVOH_Number", svohFrt);
                                cmd.Parameters.AddWithValue("@JODNI_JOFRT_SVOI_Number", svoiFrt);

                                insertedItemNumber = Convert.ToInt64(cmd.ExecuteScalar());
                            }

                            insertedItems.Add(new ItemMapDTO
                            {
                                ItemNumber = insertedItemNumber,
                                ItemMasterNumber = Convert.ToInt64(item.JODNI_Item_Number),
                                Qty = Convert.ToDecimal(item.JODNI_Qty)
                            });
                        }

                        //-------------------------------------------------
                        // BATCH INSERT
                        //-------------------------------------------------

                        int batchIndex = 0;

                        foreach (var item in insertedItems)
                        {
                            decimal balanceQty = item.Qty;

                            while (balanceQty > 0 &&
                                   batchIndex < DN_DTO.deliveryNoteBatches.Count)
                            {
                                var batch = DN_DTO.deliveryNoteBatches[batchIndex];

                                decimal useQty = 0;

                                if (batch.JODNI_BCH_BatchQty <= balanceQty)
                                {
                                    useQty = batch.JODNI_BCH_BatchQty;
                                    batchIndex++;
                                }
                                else
                                {
                                    useQty = balanceQty;
                                    DN_DTO.deliveryNoteBatches[batchIndex].JODNI_BCH_BatchQty -= balanceQty;
                                }

                                //-------------------------------------------------
                                // DELIVERY NOTE BATCH
                                //-------------------------------------------------

                                using (SqlCommand cmd = new SqlCommand(@"
                            INSERT INTO JO_DeliveryNoteBatch
                            (
                                JODNI_BCH_JODNH_Number,
                                JODNI_BCH_JODNI_Number,
                                JODNI_BCH_WH_Number,
                                JODNI_BCH_BatchDate,
                                JODNI_BCH_BatchNo,
                                JODNI_BCH_BatchQty,
                                JODNI_BCH_BatchUnitPrice,
                                JODNI_BCH_BatchValue,
                                JODNI_BCH_Ref_Batch
                            )

                            VALUES
                            (
                                @JODNH,
                                @JODNI,
                                @WH,
                                @BatchDate,
                                @BatchNo,
                                @Qty,
                                @UnitPrice,
                                @BatchValue,
                                @RefBatchNumber
                            )", con, tr))
                                {
                                    cmd.Parameters.AddWithValue("@JODNH", DN_Number);
                                    cmd.Parameters.AddWithValue("@JODNI", item.ItemNumber);
                                    cmd.Parameters.AddWithValue("@WH", batch.JODNI_BCH_WH_Number);
                                    cmd.Parameters.AddWithValue("@BatchDate", batch.JODNI_BCH_BatchDate);
                                    cmd.Parameters.AddWithValue("@BatchNo", batch.JODNI_BCH_BatchNo);
                                    cmd.Parameters.AddWithValue("@Qty", useQty);
                                    cmd.Parameters.AddWithValue("@UnitPrice", batch.JODNI_BCH_BatchUnitPrice);
                                    cmd.Parameters.AddWithValue("@BatchValue", batch.JODNI_BCH_BatchValue);
                                    cmd.Parameters.AddWithValue("@RefBatchNumber", batch.JODNI_BCH_Number);

                                    cmd.ExecuteNonQuery();
                                }

                                //-------------------------------------------------
                                // OUT COMMON BATCH
                                //-------------------------------------------------

                                using (SqlCommand cmd = new SqlCommand(@"
                            INSERT INTO OUT_COMMON_BATCH
                            (
                                OCB_TransType,
                                OCB_TransDate,
                                OCB_Header_Number,
                                OCB_LineItem_Number,
                                OCB_LineBatch_Number,
                                OCB_Warehouse_Number,
                                OCB_BatchDate,
                                OCB_BatchNo,
                                OCB_ItemStatus,
                                OCB_BatchQty,
                                OCB_BatchUnitPrice,
                                OCB_BatchValue,
                                OCB_RefBatch_Number,
                                OCB_Item_Number,
                                OCB_CreatorCode,
                                OCB_CreatorDate,
                                OCB_EditorCode,
                                OCB_EditorDate
                            )

                            VALUES
                            (
                                @TransType,
                                @TransDate,
                                @Header_Number,
                                @LineItem_Number,
                                @LineBatch_Number,
                                @Warehouse,
                                @BatchDate,
                                @BatchNo,
                                @ItemStatus,
                                @BatchQty,
                                @BatchUnitPrice,
                                @BatchValue,
                                @RefBatchNumber,
                                @Item_Number,
                                0,
                                GETDATE(),
                                0,
                                GETDATE()
                            )", con, tr))
                                {
                                    cmd.Parameters.AddWithValue("@TransType", TRANS_TYPE);
                                    cmd.Parameters.AddWithValue("@TransDate", DN_DTO.Header.JODNH_DN_Date);
                                    cmd.Parameters.AddWithValue("@Header_Number", DN_Number);
                                    cmd.Parameters.AddWithValue("@LineItem_Number", item.ItemNumber);
                                    cmd.Parameters.AddWithValue("@LineBatch_Number", batch.JODNI_BCH_Number);
                                    cmd.Parameters.AddWithValue("@Warehouse", batch.JODNI_BCH_WH_Number);
                                    cmd.Parameters.AddWithValue("@BatchDate", batch.JODNI_BCH_BatchDate);
                                    cmd.Parameters.AddWithValue("@BatchNo", batch.JODNI_BCH_BatchNo);
                                    cmd.Parameters.AddWithValue("@ItemStatus", "Good");
                                    cmd.Parameters.AddWithValue("@BatchQty", useQty);
                                    cmd.Parameters.AddWithValue("@BatchUnitPrice", batch.JODNI_BCH_BatchUnitPrice);
                                    cmd.Parameters.AddWithValue("@BatchValue", batch.JODNI_BCH_BatchValue);
                                    cmd.Parameters.AddWithValue("@RefBatchNumber", batch.JODNI_BCH_Number);
                                    cmd.Parameters.AddWithValue("@Item_Number", item.ItemMasterNumber);

                                    cmd.ExecuteNonQuery();
                                }

                                balanceQty -= useQty;
                            }
                        }

                        //-------------------------------------------------
                        // ADDRESS INSERT
                        //-------------------------------------------------

                        foreach (var addr in DN_DTO.Addresses)
                        {
                            using (SqlCommand cmd = new SqlCommand(@"
                        INSERT INTO JODNA_Address
                        (
                            JODNA_JODNH_Number,
                            JODNA_ADTP_Number,
                            JODNA_Address_ID,
                            JODNA_Address,
                            JODNA_City,
                            JODNA_State,
                            JODNA_Country,
                            JODNA_PIN,
                            JODNA_GSTIN
                        )

                        VALUES
                        (
                            @JODNH,
                            @ADTP,
                            @AddressID,
                            @Address,
                            @City,
                            @State,
                            @Country,
                            @PIN,
                            @GSTIN
                        )", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@JODNH", DN_Number);
                                cmd.Parameters.AddWithValue("@ADTP", addr.JODNA_ADTP_Number);
                                cmd.Parameters.AddWithValue("@AddressID", addr.JODNA_Address_ID);
                                cmd.Parameters.AddWithValue("@Address", addr.JODNA_Address ?? "");
                                cmd.Parameters.AddWithValue("@City", addr.JODNA_City ?? "");
                                cmd.Parameters.AddWithValue("@State", addr.JODNA_State ?? "");
                                cmd.Parameters.AddWithValue("@Country", addr.JODNA_Country ?? "");
                                cmd.Parameters.AddWithValue("@PIN", addr.JODNA_PIN ?? "");
                                cmd.Parameters.AddWithValue("@GSTIN", addr.JODNA_GSTIN ?? "");

                                cmd.ExecuteNonQuery();
                            }
                        }

                        //-------------------------------------------------
                        // CLEAR TEMP
                        //-------------------------------------------------

                        using (SqlCommand cmd = new SqlCommand(@"DELETE FROM Temp_JO_DeliveryNoteBatch", con, tr))
                        {
                            cmd.ExecuteNonQuery();
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

            return ds;
        }

        public class ItemMapDTO
        {
            public long ItemMasterNumber { get; set; }
            public long ItemNumber { get; set; }
            public decimal Qty { get; set; }
        }

        #endregion

        #region Batch lookups

        public DataSet GetOtherBatchDetailsDB(long fromWarehouse, long lineItemNumber, int ItemGridIndex)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_InCommonOtherBatch_GetBatchDetails_SP");

                db.AddInParameter(cmd, "@FromWarehouse", DbType.Int64, fromWarehouse);
                db.AddInParameter(cmd, "@LineItem_Number", DbType.Int64, lineItemNumber);
                db.AddInParameter(cmd, "@ItemGridIndex", DbType.Int64, ItemGridIndex);

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_DeliveryNote_InCommonOtherBatch_GetBatchDetails_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        public DataSet GetBatchDetailsViewDB(long fromWarehouse, long lineItemNumber)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_InCommonBatch_GetBatchView_SP");

                db.AddInParameter(cmd, "@FromWarehouse", DbType.Int64, fromWarehouse);
                db.AddInParameter(cmd, "@LineItem_Number", DbType.Int64, lineItemNumber);

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_DeliveryNote_InCommonBatch_GetBatchView_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        public void InsertEditBatchToTempDB(long JODNI_Number)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_InsertEditBatchToTemp_SP");

                db.AddInParameter(cmd, "@JODNI_Number", DbType.Int64, JODNI_Number);

                db.ExecuteNonQuery(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_DeliveryNote_InsertEditBatchToTemp_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        // Edit page : item changed -> stock for the new item (no saved batch)
        public DataSet GetBatchDetailsEditDB_ItemChanged(long fromWarehouse, long lineItemNumber, long JODNI_Number, int ItemGridIndex, long JODNH_Number)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_GetBatchStock_SP");

                db.AddInParameter(cmd, "@Warehouse_Number", DbType.Int64, fromWarehouse);
                db.AddInParameter(cmd, "@Item_Number", DbType.Int64, lineItemNumber);
                db.AddInParameter(cmd, "@DBCH_Index", DbType.Int64, ItemGridIndex);

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_GetBatchStock_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        public DataSet GetBatchDetailsEditDB(long fromWarehouse, long lineItemNumber, long JODNI_Number, int ItemGridIndex)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_GetBatchDetails_Edit_SP");

                db.AddInParameter(cmd, "@Warehouse_Number", DbType.Int64, fromWarehouse);
                db.AddInParameter(cmd, "@LineItem_Number", DbType.Int64, JODNI_Number);
                db.AddInParameter(cmd, "@ItemGridIndex", DbType.Int64, ItemGridIndex);

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_DeliveryNote_GetBatchDetails_Edit_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        public DataSet GetBatchDetailsDB(long fromWarehouse, long lineItemNumber, int ItemGridIndex)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_InCommonBatch_GetBatchDetails_SP");

                db.AddInParameter(cmd, "@FromWarehouse", DbType.Int64, fromWarehouse);
                db.AddInParameter(cmd, "@LineItem_Number", DbType.Int64, lineItemNumber);
                db.AddInParameter(cmd, "@ItemGridIndex", DbType.Int64, ItemGridIndex);

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JO_DeliveryNote_InCommonBatch_GetBatchDetails_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        #endregion

        #region Temp batch rows

        /*
            Insert Temp Delivery Batch Record.
            Only 4 values are passed: DBCH_Index, DBCH_Item_Number, DBCH_Warehouse_Number, DBCH_DBCH_Number.
            All other columns saved as 0 / Empty / Default.
        */
        public void InsertTempDeliveryBatch(
            int DBCH_Index,
            long DBCH_Item_Number,
            long DBCH_Warehouse_Number,
            long DBCH_DBCH_Number)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlCommand cmd = new SqlCommand(@"
DELETE FROM Temp_JO_DeliveryNoteBatch
WHERE DBCH_Index = @DBCH_Index;

INSERT INTO Temp_JO_DeliveryNoteBatch
(
    DBCH_Index,
    DBCH_DBCH_Number,
    DBCH_Item_Number,
    DBCH_Warehouse_Number,
    DBCH_Date,
    DBCH_No,
    DBCH_Qty,
    DBCH_UnitPrice,
    DBCH_Value,
    Mode,
    CreatorCode,
    CreatorDate,
    DBCH_MainQty,
    JODNI_Number,
    JODNH_Number,
    RefBatch_Number,
    ReservedQty
)
SELECT
    @DBCH_Index,
    @DBCH_DBCH_Number,
    @DBCH_Item_Number,
    @DBCH_Warehouse_Number,
    GETDATE(),
    '',
    0,
    0,
    0,
    1,
    1,
    GETDATE(),
    0,
    0,
    0,
    B.LineBatch_Number,   -- RefBatch_Number
    0
FROM
(
    SELECT DISTINCT ICB_LineBatch_Number AS LineBatch_Number
    FROM IN_COMMON_BATCH
    WHERE ICB_Item_Number = @DBCH_Item_Number
      AND ICB_Warehouse_Number = @DBCH_Warehouse_Number
) B;
        ", con))
                {
                    cmd.Parameters.AddWithValue("@DBCH_Index", DBCH_Index);
                    cmd.Parameters.AddWithValue("@DBCH_DBCH_Number", DBCH_DBCH_Number);
                    cmd.Parameters.AddWithValue("@DBCH_Item_Number", DBCH_Item_Number);
                    cmd.Parameters.AddWithValue("@DBCH_Warehouse_Number", DBCH_Warehouse_Number);

                    cmd.ExecuteNonQuery();
                }
            }
        }

        public void TempDeliveryBatchSaveDB(List<JO_TempDeliveryBatch_DTO> list)
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
                        // all rows belong to same grid index
                        var first = list.First();

                        using (SqlCommand delCmd = new SqlCommand(@"
                    DELETE FROM Temp_JO_DeliveryNoteBatch
                    WHERE DBCH_Index = @DBCH_Index
                ", con, tr))
                        {
                            delCmd.Parameters.AddWithValue("@DBCH_Index", first.DBCH_Index);
                            delCmd.ExecuteNonQuery();
                        }

                        foreach (var obj in list)
                        {
                            using (SqlCommand cmd = new SqlCommand(@"
                        INSERT INTO Temp_JO_DeliveryNoteBatch
                        (
                            DBCH_Index,
                            DBCH_DBCH_Number,
                            DBCH_Item_Number,
                            DBCH_Warehouse_Number,
                            DBCH_Date,
                            DBCH_No,
                            DBCH_Qty,
                            DBCH_UnitPrice,
                            DBCH_Value,
                            JODNI_Number,
                            JODNH_Number,
                            Mode,
                            CreatorCode,
                            CreatorDate,
                            RefBatch_Number
                        )
                        VALUES
                        (
                            @DBCH_Index,
                            @DBCH_DBCH_Number,
                            @DBCH_Item_Number,
                            @DBCH_Warehouse_Number,
                            @DBCH_Date,
                            @DBCH_No,
                            @DBCH_Qty,
                            @DBCH_UnitPrice,
                            @DBCH_Value,
                            @JODNI_Number,
                            @JODNH_Number,
                            @Mode,
                            @CreatorCode,
                            @CreatorDate,
                            @RefBatch_Number
                        )
                    ", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@DBCH_Index", obj.DBCH_Index);
                                cmd.Parameters.AddWithValue("@DBCH_DBCH_Number", (object?)obj.DBCH_DBCH_Number ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@DBCH_Item_Number", obj.DBCH_Item_Number);
                                cmd.Parameters.AddWithValue("@DBCH_Warehouse_Number", obj.DBCH_Warehouse_Number);
                                cmd.Parameters.AddWithValue("@DBCH_Date", obj.DBCH_Date);
                                cmd.Parameters.AddWithValue("@DBCH_No", (object?)obj.DBCH_No ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@DBCH_Qty", obj.DBCH_Qty);
                                cmd.Parameters.AddWithValue("@DBCH_UnitPrice", (object?)obj.DBCH_UnitPrice ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@DBCH_Value", (object?)obj.DBCH_Value ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@Mode", obj.Mode ?? 1);
                                cmd.Parameters.AddWithValue("@CreatorCode", obj.CreatorCode);
                                cmd.Parameters.AddWithValue("@CreatorDate", obj.CreatorDate);
                                cmd.Parameters.AddWithValue("@JODNI_Number", (object?)obj.JODNI_Number ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@JODNH_Number", (object?)obj.JODNH_Number ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@RefBatch_Number", (object?)obj.RefBatch_Number ?? DBNull.Value);

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

        public void TempDeliveryBatchDeleteChangeItemDBRow(int index)
        {
            TempDeliveryBatchDeleteDBRow(index);
        }

        public void TempDeliveryBatchEditChangeItemDBRow(long DBCH_Item_Number, long warehouse, long JODNI_Number, long JODNH_Number, int DBCH_Index)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        using (SqlCommand cmd = new SqlCommand(@"
                   UPDATE Temp_JO_DeliveryNoteBatch
                   SET DBCH_Warehouse_Number = @DBCH_Warehouse_Number,
                       DBCH_Item_Number = @DBCH_Item_Number,
                       DBCH_Date = GETDATE(),
                       DBCH_No = NULL,
                       DBCH_DBCH_Number = 0,
                       DBCH_Qty = 0,
                       DBCH_UnitPrice = 0,
                       DBCH_Value = 0
WHERE
(
    (@JODNI_Number <> 0
        AND JODNI_Number = @JODNI_Number
        AND JODNH_Number = @JODNH_Number
    )
    OR
    (@JODNI_Number = 0
        AND DBCH_Index = @DBCH_Index
    )
);
", con, tr))
                        {
                            cmd.Parameters.AddWithValue("@DBCH_Item_Number", DBCH_Item_Number);
                            cmd.Parameters.AddWithValue("@DBCH_Warehouse_Number", warehouse);
                            cmd.Parameters.AddWithValue("@JODNI_Number", JODNI_Number);
                            cmd.Parameters.AddWithValue("@JODNH_Number", JODNH_Number);
                            cmd.Parameters.AddWithValue("@DBCH_Index", DBCH_Index);
                            cmd.ExecuteNonQuery();
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

        public void TempDeliveryBatchDeleteDBRow(int index)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        // DELETE INDEX GROUP
                        using (SqlCommand delCmd = new SqlCommand(@"
                    DELETE FROM Temp_JO_DeliveryNoteBatch
                    WHERE DBCH_Index = @DBCH_Index;
                ", con, tr))
                        {
                            delCmd.Parameters.AddWithValue("@DBCH_Index", index);
                            delCmd.ExecuteNonQuery();
                        }

                        // RESEQUENCE INDEX GROUPS
                        using (SqlCommand seqCmd = new SqlCommand(@"
                    ;WITH Grouped AS
                    (
                        SELECT DISTINCT DBCH_Index
                        FROM Temp_JO_DeliveryNoteBatch
                    ),
                    Renumber AS
                    (
                        SELECT
                            DBCH_Index,
                            ROW_NUMBER() OVER (ORDER BY DBCH_Index) AS NewIndex
                        FROM Grouped
                    )
                    UPDATE t
                    SET t.DBCH_Index = r.NewIndex
                    FROM Temp_JO_DeliveryNoteBatch t
                    JOIN Renumber r
                        ON t.DBCH_Index = r.DBCH_Index;
                ", con, tr))
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

        public void DeleteRemovedRowsDB(List<JO_DeletedRowInfo_DTO> deletedRows)
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
                            // DELETE STOCK-OUT (OUT_COMMON_BATCH) of this row
                            using (SqlCommand cmd = new SqlCommand(@"
                        DELETE FROM OUT_COMMON_BATCH
                        WHERE OCB_TransType = @TransType
                          AND OCB_Header_Number = @JODNH_Number
                          AND OCB_LineItem_Number = @JODNI_Number
                          AND @JODNI_Number > 0;
                    ", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@TransType", TRANS_TYPE);
                                cmd.Parameters.AddWithValue("@JODNI_Number", item.JODNI_Number);
                                cmd.Parameters.AddWithValue("@JODNH_Number", item.JODNH_Number);
                                cmd.ExecuteNonQuery();
                            }

                            // DELETE BATCH
                            using (SqlCommand cmd = new SqlCommand(@"
                        DELETE FROM JO_DeliveryNoteBatch
                        WHERE JODNI_BCH_JODNI_Number = @JODNI_Number
                          AND JODNI_BCH_JODNH_Number = @JODNH_Number;
                    ", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@JODNI_Number", item.JODNI_Number);
                                cmd.Parameters.AddWithValue("@JODNH_Number", item.JODNH_Number);
                                cmd.ExecuteNonQuery();
                            }

                            // DELETE ITEM
                            using (SqlCommand cmd = new SqlCommand(@"
                        DELETE FROM JO_DeliveryNoteItem
                        WHERE JODNI_Number = @JODNI_Number
                          AND JODNI_JODNH_Number = @JODNH_Number;
                    ", con, tr))
                            {
                                cmd.Parameters.AddWithValue("@JODNI_Number", item.JODNI_Number);
                                cmd.Parameters.AddWithValue("@JODNH_Number", item.JODNH_Number);
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

        public void UpdateTempBatchReservedQty()
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlCommand cmd = new SqlCommand(@"
;WITH BatchTotal AS
(
    SELECT
        DBCH_Item_Number,
        DBCH_Warehouse_Number,
        RefBatch_Number,
        SUM(ISNULL(DBCH_Qty,0)) AS TotalQty
    FROM Temp_JO_DeliveryNoteBatch
    GROUP BY
        DBCH_Item_Number,
        DBCH_Warehouse_Number,
        RefBatch_Number
)

UPDATE T
SET T.ReservedQty =
        ISNULL(B.TotalQty,0)
      - ISNULL(T.DBCH_Qty,0)

FROM Temp_JO_DeliveryNoteBatch T

INNER JOIN BatchTotal B
    ON  T.DBCH_Item_Number      = B.DBCH_Item_Number
    AND T.DBCH_Warehouse_Number = B.DBCH_Warehouse_Number
    AND T.RefBatch_Number       = B.RefBatch_Number;
        ", con))
                {
                    cmd.ExecuteNonQuery();
                }
            }
        }

        #endregion

        #region Saved batch / stock details

        // View page: the batches SAVED on one Delivery Note item (read-only)
        public DataTable GetSavedBatchDetails(long JODNH_Number, long JODNI_Number)
        {
            DataTable dt = new DataTable();

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                using (SqlCommand cmd = new SqlCommand(@"
        SELECT
            B.JODNI_BCH_Number          AS LineBatch_Number,
            W.WarehouseCode             AS WareHouseCode,
            B.JODNI_BCH_BatchDate       AS BatchDate,
            B.JODNI_BCH_BatchNo         AS BatchNo,
            B.JODNI_BCH_BatchQty        AS BatchQty,
            B.JODNI_BCH_BatchUnitPrice  AS BatchUnitPrice,
            B.JODNI_BCH_BatchValue      AS BatchValue
        FROM JO_DeliveryNoteBatch B
        LEFT JOIN Warehouse W ON W.WarehouseNumber = B.JODNI_BCH_WH_Number
        WHERE B.JODNI_BCH_JODNH_Number = @JODNH_Number
          AND B.JODNI_BCH_JODNI_Number = @JODNI_Number
        ORDER BY B.JODNI_BCH_Number
        ", con))
                {
                    cmd.Parameters.AddWithValue("@JODNH_Number", JODNH_Number);
                    cmd.Parameters.AddWithValue("@JODNI_Number", JODNI_Number);

                    using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    {
                        da.Fill(dt);
                    }
                }
            }

            return dt;
        }

        public DataTable GetBatchStockDetails(
            long Item_Number,
            long Warehouse,
            long Header_Number,
            long LineItem_Number,
            int ItemGridIndex)
        {
            DataTable dt = new DataTable();

            UpdateTempBatchReservedQty();

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                using (SqlCommand cmd = new SqlCommand(@"
SELECT DISTINCT
    I.ICB_LineBatch_Number AS LineBatch_Number,
    I.ICB_BatchNo AS BatchNo,
    I.ICB_BatchDate AS BatchDate,
    I.ICB_Item_Number AS Item_Number,
    I.ICB_Warehouse_Number AS FromWarehouse,

    ISNULL(I.ICB_BatchQty,0) AS BatchQty,

    -- Delivered Qty from current draft
    ISNULL(temp.DBCH_Qty,0) AS DeliveredQty,

    ISNULL(I.ICB_BatchQty,0) AS QtyReceived,

    ISNULL(T.TotalDeliveredQty,0) AS QtyUsedTillNow,

    -- Reserved Qty from other grid rows
    ISNULL(R.ReservedQty,0) AS ReservedQty,

    -- Final Available Qty
    ISNULL(I.ICB_BatchQty,0) - ISNULL(T.TotalDeliveredQty,0) AS AvailableQty,

    ISNULL(I.ICB_BatchUnitPrice,0) AS BatchUnitPrice,
    ISNULL(temp.DBCH_Qty,0) * ISNULL(I.ICB_BatchUnitPrice,0) AS BatchValue,
    I.ICB_LineBatch_Number AS RefBatch_Number,

    W.WarehouseCode

FROM IN_COMMON_BATCH I

---- Already consumed stock
LEFT JOIN
(
    SELECT
        OCB_RefBatch_Number AS RefBatch_Number,
        SUM(OCB_BatchQty) AS TotalDeliveredQty
    FROM OUT_COMMON_BATCH
    GROUP BY OCB_RefBatch_Number
) T
    ON T.RefBatch_Number = I.ICB_LineBatch_Number

-- Reserved Qty from Temp Table
LEFT JOIN
(
    SELECT
        RefBatch_Number,
        DBCH_Index,
        SUM(ReservedQty) AS ReservedQty
    FROM Temp_JO_DeliveryNoteBatch
    GROUP BY
        RefBatch_Number,
        DBCH_Index
) R
    ON R.RefBatch_Number = I.ICB_LineBatch_Number
   AND R.DBCH_Index = @ItemGridIndex

LEFT JOIN Warehouse W
    ON W.WarehouseNumber = I.ICB_Warehouse_Number

LEFT JOIN
(
    SELECT DBCH_Qty, RefBatch_Number
    FROM Temp_JO_DeliveryNoteBatch
    WHERE DBCH_Index = @ItemGridIndex
) temp
    ON temp.RefBatch_Number = I.ICB_LineBatch_Number

WHERE I.ICB_Item_Number = @Item_Number
  AND I.ICB_Warehouse_Number = @Warehouse;
        ", con))
                {
                    cmd.Parameters.AddWithValue("@Item_Number", Item_Number);
                    cmd.Parameters.AddWithValue("@Warehouse", Warehouse);
                    cmd.Parameters.AddWithValue("@ItemGridIndex", ItemGridIndex);

                    using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    {
                        da.Fill(dt);
                    }
                }
            }

            return dt;
        }

        #endregion

        #region ValidateBatchDetails

        // NOTE: depends on dbo.JO_FN_ValidateBatchDetails (to be created - JO copy of FN_ValidateBatchDetails)
        public string ValidateBatchDetails(long JODNH_Number)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());

                DbCommand cmd = db.GetSqlStringCommand(@"SELECT dbo.JO_FN_ValidateBatchDetails(@JODNH_Number)");

                db.AddInParameter(cmd, "@JODNH_Number", DbType.Int64, JODNH_Number);

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

        #endregion

        #region Validate_Amended_BatchQty

        public List<JO_BatchQtyValidationDto> Validate_Amended_BatchQty(long JODNH_Number)
        {
            List<JO_BatchQtyValidationDto> result = new List<JO_BatchQtyValidationDto>();

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlCommand cmd = new SqlCommand(@"
            SELECT
                DBCH_Index,
                SUM(ISNULL(DBCH_Qty,0)) AS DBCH_Qty
            FROM Temp_JO_DeliveryNoteBatch
            WHERE JODNH_Number = @JODNH_Number
            GROUP BY DBCH_Index
        ", con))
                {
                    cmd.Parameters.Add("@JODNH_Number", SqlDbType.BigInt).Value = JODNH_Number;

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            result.Add(new JO_BatchQtyValidationDto
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

        #region Freight service order

        // Freight SO list (FromWH/ToWH based, JOFRT tables)
        public DataSet GetFreightServiceOrderDB(
            long vendorId,
            long? uomNumber = null,
            long? fromWHNumber = null,
            long? toWHNumber = null)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("JOFRT_ServiceOrder_GetByVendor_DN_SP");

                db.AddInParameter(cmd, "@VendorId", DbType.Int64, vendorId);
                db.AddInParameter(cmd, "@UoM_Number", DbType.Int64,
                    uomNumber.HasValue ? (object)uomNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64,
                    fromWHNumber.HasValue ? (object)fromWHNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64,
                    toWHNumber.HasValue ? (object)toWHNumber.Value : DBNull.Value);

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : JOFRT_ServiceOrder_GetByVendor_DN_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        public DataSet CheckDeliveredQtyExceededFreightDB_New(
            long jofrtSvohNumber,
            long? uomNumber = null,
            long? fromWHNumber = null,
            long? toWHNumber = null)
        {
            try
            {
                Database db = new SqlDatabase(DB.Connection());
                DbCommand cmd = db.GetStoredProcCommand("USP_CheckDeliveredQtyExceeded_Freight_JODN_SP");

                db.AddInParameter(cmd, "@JOFRT_SVOH_Number", DbType.Int64, jofrtSvohNumber);
                db.AddInParameter(cmd, "@UoM_Number", DbType.Int64,
                    uomNumber.HasValue ? (object)uomNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64,
                    fromWHNumber.HasValue ? (object)fromWHNumber.Value : DBNull.Value);
                db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64,
                    toWHNumber.HasValue ? (object)toWHNumber.Value : DBNull.Value);

                return db.ExecuteDataSet(cmd);
            }
            catch (SqlException ex)
            {
                throw new Exception("SQL Error : " + ex.Message + Environment.NewLine +
                    "Procedure : USP_CheckDeliveredQtyExceeded_Freight_JODN_SP", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Application Error : " + ex.Message, ex);
            }
        }

        #endregion
    }

    public class JO_BatchQtyValidationDto
    {
        public int DBCH_Index { get; set; }
        public decimal DBCH_Qty { get; set; }
    }
}