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
    // GST calc row (local to this DAO - no dependency on other modules)
    public class JO_FreightGstCalc
    {
        public long TaxIndex { get; set; }
        public long GSTCNumber { get; set; }
        public long GSTTNumber { get; set; }
        public long GSTENumber { get; set; }
        public int Calculation { get; set; }
        public int Chargeable { get; set; }
        public double Percentage { get; set; }
        public double AssessableValue { get; set; }
        public double Amount { get; set; }
    }

    public class JO_FreightInvoice_DAO
    {
        DBConnect DB = new DBConnect();

        #region Save (Insert)

        public long FreightInvoiceInsertDB(JO_FreightInvoiceCreate_DTO dto)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        long headNo = HeadInsert(dto, con, tr);
                        DataTable items = ItemBulkInsert(headNo, dto, con, tr);
                        GSTInsert(headNo, items, dto, con, tr);
                        AddressUpdate(headNo, dto.Addresses, con, tr);
                        tr.Commit();
                        return headNo;
                    }
                    catch (Exception)
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }
        }

        private long HeadInsert(JO_FreightInvoiceCreate_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            using (SqlCommand cmd = new SqlCommand("JO_FreightInvoiceHead_Insert_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                AddHeadParams(cmd, dto.Header);
                return Convert.ToInt64(cmd.ExecuteScalar());
            }
        }

        private void AddHeadParams(SqlCommand cmd, JO_FreightInvoiceHead_DTO h)
        {
            cmd.Parameters.AddWithValue("@JOFTIH_JournalNo", (object)h.JOFTIH_JournalNo ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@JOFTIH_JournalDate", h.JOFTIH_JournalDate);
            cmd.Parameters.AddWithValue("@JOFTIH_VendorInvoiceNo", (object)h.JOFTIH_VendorInvoiceNo ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@JOFTIH_VendorInvoiceDate", h.JOFTIH_VendorInvoiceDate);
            cmd.Parameters.AddWithValue("@JOFTIH_Category", h.JOFTIH_Category ?? "DELIVERY NOTE");
            cmd.Parameters.AddWithValue("@JOFTIH_JW_Vendor_Number", h.JOFTIH_JW_Vendor_Number);
            cmd.Parameters.AddWithValue("@JOFTIH_Currency_Number", h.JOFTIH_Currency_Number);
            cmd.Parameters.AddWithValue("@JOFTIH_TCT_Number", h.JOFTIH_TCT_Number);
            cmd.Parameters.AddWithValue("@JOFTIH_WHT_Number", h.JOFTIH_WHT_Number ?? 0);
            cmd.Parameters.AddWithValue("@JOFTIH_RCM", h.JOFTIH_RCM ?? "No");
            cmd.Parameters.AddWithValue("@JOFTIH_PaymentTerms", (object)h.JOFTIH_PaymentTerms ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@JOFTIH_PaymentMethod", (object)h.JOFTIH_PaymentMethod ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@JOFTIH_Remarks", (object)h.JOFTIH_Remarks ?? DBNull.Value);
        }

        #endregion

        #region Update

        public void FreightInvoiceUpdateDB(JO_FreightInvoiceCreate_DTO dto)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        long headNo = dto.Header.JOFTIH_Number;

                        using (SqlCommand cmd = new SqlCommand("JO_FreightInvoiceHead_Update_SP", con, tr))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@JOFTIH_Number", headNo);
                            AddHeadParams(cmd, dto.Header);
                            cmd.ExecuteNonQuery();
                        }

                        // BulkUpdate deletes old GST rows and returns final items -> GST recalculated
                        DataTable items = ItemBulkUpdate(headNo, dto, con, tr);
                        GSTInsert(headNo, items, dto, con, tr);
                        AddressUpdate(headNo, dto.Addresses, con, tr);

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

        #endregion

        #region Items (TVP)

        private DataTable BuildItemTable(long headNo, List<JO_FreightInvoiceItem_DTO> list, bool isUpdate)
        {
            // column ORDER must match dbo.JO_FreightInvoiceItemType
            DataTable dt = new DataTable();
            dt.Columns.Add("JOFTII_Number", typeof(long));
            dt.Columns.Add("JOFTII_JOFTIH_Number", typeof(long));
            dt.Columns.Add("JOFTII_JOFRT_SVOH_Number", typeof(long));
            dt.Columns.Add("JOFTII_JOFRT_SVOI_Number", typeof(long));
            dt.Columns.Add("JOFTII_JOMNH_Number", typeof(long));
            dt.Columns.Add("JOFTII_JOMNI_Number", typeof(long));
            dt.Columns.Add("JOFTII_JPRS_Number", typeof(long));
            dt.Columns.Add("JOFTII_Item_Number", typeof(long));
            dt.Columns.Add("JOFTII_FromWH_Number", typeof(long));
            dt.Columns.Add("JOFTII_ToWH_Number", typeof(long));
            dt.Columns.Add("JOFTII_UoM_Number", typeof(long));
            dt.Columns.Add("JOFTII_Qty_Kgs", typeof(double));
            dt.Columns.Add("JOFTII_Rate", typeof(double));
            dt.Columns.Add("JOFTII_Amount", typeof(double));
            dt.Columns.Add("JOFTII_SAC_Number", typeof(long));
            dt.Columns.Add("JOFTII_GST_Amount", typeof(double));
            dt.Columns.Add("JOFTII_WHT_Percent", typeof(double));
            dt.Columns.Add("JOFTII_WH_TaxAmount", typeof(double));
            dt.Columns.Add("JOFTII_SourceCategory", typeof(string));
            dt.Columns.Add("JOFTII_RCM", typeof(string));
            dt.Columns.Add("JOFTII_SVO_Assign", typeof(string));

            foreach (var i in list)
            {
                dt.Rows.Add(
                    isUpdate ? i.JOFTII_Number : 0,
                    headNo,
                    i.JOFTII_JOFRT_SVOH_Number,
                    i.JOFTII_JOFRT_SVOI_Number,
                    i.JOFTII_JOMNH_Number,
                    i.JOFTII_JOMNI_Number,
                    i.JOFTII_JPRS_Number,
                    i.JOFTII_Item_Number,
                    (object)i.JOFTII_FromWH_Number ?? DBNull.Value,
                    (object)i.JOFTII_ToWH_Number ?? DBNull.Value,
                    i.JOFTII_UoM_Number,
                    i.JOFTII_Qty_Kgs,
                    i.JOFTII_Rate,
                    i.JOFTII_Amount,
                    i.JOFTII_SAC_Number,
                    i.JOFTII_GST_Amount,
                    i.JOFTII_WHT_Percent,
                    i.JOFTII_WH_TaxAmount,
                    i.JOFTII_SourceCategory ?? "DELIVERY NOTE",
                    i.JOFTII_RCM ?? "No",
                    (object)i.JOFTII_SVO_Assign ?? DBNull.Value
                );
            }
            return dt;
        }

        private DataTable ItemBulkInsert(long headNo, JO_FreightInvoiceCreate_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            return RunItemSP("JO_FreightInvoiceItem_BulkInsert_SP", headNo, BuildItemTable(headNo, dto.Items, false), con, tr);
        }

        private DataTable ItemBulkUpdate(long headNo, JO_FreightInvoiceCreate_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            return RunItemSP("JO_FreightInvoiceItem_BulkUpdate_SP", headNo, BuildItemTable(headNo, dto.Items, true), con, tr);
        }

        private DataTable RunItemSP(string sp, long headNo, DataTable dt, SqlConnection con, SqlTransaction tr)
        {
            using (SqlCommand cmd = new SqlCommand(sp, con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@JOFTIH_Number", headNo);
                SqlParameter p = cmd.Parameters.AddWithValue("@Items", dt);
                p.SqlDbType = SqlDbType.Structured;
                p.TypeName = "dbo.JO_FreightInvoiceItemType";

                DataTable result = new DataTable();
                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    da.Fill(result);
                return result;
            }
        }

        #endregion

        #region GST (calculate + insert)

        private void GSTInsert(long headNo, DataTable items, JO_FreightInvoiceCreate_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            foreach (DataRow row in items.Rows)
            {
                long itemNo = Convert.ToInt64(row["JOFTII_Number"]);
                long sacNo = Convert.ToInt64(row["JOFTII_SAC_Number"]);
                double amount = Convert.ToDouble(row["JOFTII_Amount"]);

                var gstRows = CalculateGST(
                    dto.Header.JOFTIH_TCT_Number,
                    dto.Header.JOFTIH_JournalDate,
                    sacNo,
                    amount,
                    con, tr);

                int idx = 1;
                foreach (var g in gstRows)
                {
                    using (SqlCommand cmd = new SqlCommand("JO_FreightInvoiceGST_Insert_SP", con, tr))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@JOFTIG_JOFTIH_Number", headNo);
                        cmd.Parameters.AddWithValue("@JOFTIG_JOFTII_Number", itemNo);
                        cmd.Parameters.AddWithValue("@JOFTIG_Index", idx);
                        cmd.Parameters.AddWithValue("@JOFTIG_GSTC_Number", g.GSTCNumber);
                        cmd.Parameters.AddWithValue("@JOFTIG_GSTT_Number", g.GSTTNumber);
                        cmd.Parameters.AddWithValue("@JOFTIG_GSTE_Number", g.GSTENumber);
                        cmd.Parameters.AddWithValue("@JOFTIG_AssessableValue", g.AssessableValue);
                        cmd.Parameters.AddWithValue("@JOFTIG_Percent", g.Percentage);
                        cmd.Parameters.AddWithValue("@JOFTIG_GST_Amount", g.Amount);
                        cmd.ExecuteNonQuery();
                    }
                    idx++;
                }
            }
        }

        // uses JO_JobworkInvoice_SP  Id = 12 (same tax engine as JO Jobwork Invoice)
        private List<JO_FreightGstCalc> CalculateGST(long cluster, DateTime invDate, long sacNo, double baseAmount,
                                                     SqlConnection con, SqlTransaction tr)
        {
            var result = new List<JO_FreightGstCalc>();
            if (cluster <= 0 || sacNo <= 0) return result;

            DataTable dt = new DataTable();
            using (SqlCommand cmd = new SqlCommand("JO_JobworkInvoice_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@JW_Inv_Id", 12);
                cmd.Parameters.AddWithValue("@JOSVIH_VendorInvoiceDate", invDate.Date);
                cmd.Parameters.AddWithValue("@TaxCluster_Number", cluster);
                cmd.Parameters.AddWithValue("@SAC_Number", sacNo);
                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    da.Fill(dt);
            }

            var list = new List<JO_FreightGstCalc>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_FreightGstCalc
                {
                    TaxIndex = Convert.ToInt64(dr["TaxIndex"]),
                    GSTCNumber = dr["GSTCNumber"] == DBNull.Value ? 0 : Convert.ToInt64(dr["GSTCNumber"]),
                    GSTTNumber = dr["GSTTNumber"] == DBNull.Value ? 0 : Convert.ToInt64(dr["GSTTNumber"]),
                    GSTENumber = dr["GSTENumber"] == DBNull.Value ? 0 : Convert.ToInt64(dr["GSTENumber"]),
                    Calculation = Convert.ToInt32(dr["Calculation"]),
                    Chargeable = dr["Chargeable"] == DBNull.Value ? 0 : Convert.ToInt32(dr["Chargeable"]),
                    Percentage = dr["Percentage"] == DBNull.Value ? 0 : Convert.ToDouble(dr["Percentage"])
                });
            }
            if (!list.Any()) return result;

            var groupTotals = new Dictionary<long, double>();

            foreach (var group in list.GroupBy(x => x.TaxIndex))
            {
                double groupTotal = 0, groupAssessable = 0;

                var calcOne = group.Where(x => x.Calculation == 1).ToList();
                if (!calcOne.Any()) continue;
                var first = calcOne.First();

                foreach (var item in group)
                {
                    if (item.Chargeable == 4 && item.Calculation == 1)
                    {
                        groupTotal += baseAmount * (item.Percentage / 100);
                        groupAssessable += baseAmount;
                    }
                    else if (item.Calculation == 0 && groupTotals.ContainsKey(item.GSTENumber))
                    {
                        double baseVal = groupTotals[item.GSTENumber];
                        groupTotal += baseVal * (item.Percentage / 100);
                        groupAssessable += baseVal;
                    }
                }

                result.Add(new JO_FreightGstCalc
                {
                    TaxIndex = group.Key,
                    GSTCNumber = first.GSTCNumber,
                    GSTTNumber = first.GSTTNumber,
                    GSTENumber = first.GSTENumber,
                    Percentage = first.Percentage,
                    AssessableValue = groupAssessable,
                    Amount = groupTotal
                });

                groupTotals[first.GSTENumber] = groupTotal;
            }
            return result;
        }

        #endregion

        #region Address (TVP)

        private void AddressUpdate(long headNo, List<JO_FreightInvoiceAddress_DTO> list, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("JOFTIA_ADTP_Number", typeof(long));
            dt.Columns.Add("JOFTIA_Address_ID", typeof(string));
            dt.Columns.Add("JOFTIA_Address", typeof(string));
            dt.Columns.Add("JOFTIA_City", typeof(string));
            dt.Columns.Add("JOFTIA_State", typeof(string));
            dt.Columns.Add("JOFTIA_Country", typeof(string));
            dt.Columns.Add("JOFTIA_PIN", typeof(string));
            dt.Columns.Add("JOFTIA_GSTIN", typeof(string));

            foreach (var a in (list ?? new List<JO_FreightInvoiceAddress_DTO>()))
            {
                dt.Rows.Add(a.JOFTIA_ADTP_Number, a.JOFTIA_Address_ID, a.JOFTIA_Address, a.JOFTIA_City,
                            a.JOFTIA_State, a.JOFTIA_Country, a.JOFTIA_PIN, a.JOFTIA_GSTIN);
            }

            using (SqlCommand cmd = new SqlCommand("JO_FreightInvoiceAddress_Update_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@JOFTIH_Number", headNo);
                SqlParameter p = cmd.Parameters.AddWithValue("@Address", dt);
                p.SqlDbType = SqlDbType.Structured;
                p.TypeName = "dbo.JO_FreightInvoiceAddressType";
                cmd.ExecuteNonQuery();
            }
        }

        #endregion

        #region Get (Edit / View)  -> 4 tables: 0 Head, 1 Items, 2 Address, 3 GST

        public DataSet GetFreightInvoiceDB(long headNo)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_FreightInvoice_Get_SP");
            db.AddInParameter(cmd, "@JOFTIH_Number", DbType.Int64, headNo);
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetFreightInvoiceAddressDB(long headNo)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_FreightInvoiceAddress_Get_SP");
            db.AddInParameter(cmd, "@JOFTIH_Number", DbType.Int64, headNo);
            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region Lists  (Summary: 0 rows,1 totals | Detailed: 0 rows,1 totals)

        public DataSet GetFreightInvoiceList()
        {
            Database db = new SqlDatabase(DB.Connection());
            return db.ExecuteDataSet(db.GetStoredProcCommand("JO_FreightInvoice_List_SP"));
        }

        public DataSet GetFreightInvoiceListDetailed()
        {
            Database db = new SqlDatabase(DB.Connection());
            return db.ExecuteDataSet(db.GetStoredProcCommand("JO_FreightInvoice_ListDetailed_SP"));
        }

        #endregion

        #region Source popup: Delivery Note / Receipt Note

        public DataSet GetDeliveryNoteGroupDB(long vendorNo)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_GroupItem_Freight_SP");
            db.AddInParameter(cmd, "@VendorNumber", DbType.Int64, vendorNo);
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetDeliveryNoteItemsDB(long vendorNo, string dnNumbers)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_DeliveryNote_ForFreightInvoice_SP");
            db.AddInParameter(cmd, "@VendorNumber", DbType.Int64, vendorNo);
            db.AddInParameter(cmd, "@DNNumbers", DbType.String, dnNumbers);
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetReceiptNoteGroupDB(long vendorNo)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_GroupItem_Freight_SP");
            db.AddInParameter(cmd, "@VendorNumber", DbType.Int64, vendorNo);
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetReceiptNoteItemsDB(long vendorNo, string rnNumbers)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_ForFreightInvoice_SP");
            db.AddInParameter(cmd, "@VendorNumber", DbType.Int64, vendorNo);
            db.AddInParameter(cmd, "@RNNumbers", DbType.String, rnNumbers);
            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region Freight Service Order

        public DataSet GetFreightServiceOrderDB(long vendorId, string category,
            long? uomNo = null, long? fromWH = null, long? toWH = null)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_FreightServiceOrder_ForDropdown_SP");
            db.AddInParameter(cmd, "@VendorId", DbType.Int64, vendorId);
            db.AddInParameter(cmd, "@Category", DbType.String, category);
            db.AddInParameter(cmd, "@UoM_Number", DbType.Int64, uomNo.HasValue ? (object)uomNo.Value : DBNull.Value);
            db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64, fromWH.HasValue ? (object)fromWH.Value : DBNull.Value);
            db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64, toWH.HasValue ? (object)toWH.Value : DBNull.Value);
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetFreightServiceOrderItemInfoDB(long soNo, long fromWH, long toWH, long uomNo)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_FreightServiceOrderItem_Info_SP");
            db.AddInParameter(cmd, "@JOFRT_SVOH_Number", DbType.Int64, soNo);
            db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64, fromWH);
            db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64, toWH);
            db.AddInParameter(cmd, "@UoM_Number", DbType.Int64, uomNo);
            return db.ExecuteDataSet(cmd);
        }

        public DataSet CheckAllowedQtyDB(long soNo, long jprsNo, long fromWH, long toWH, long uomNo, long headNo)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_FreightServiceOrder_CheckAllowedQty_SP");
            db.AddInParameter(cmd, "@JOFRT_SVOH_Number", DbType.Int64, soNo);
            db.AddInParameter(cmd, "@JPRS_Number", DbType.Int64, jprsNo);
            db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64, fromWH);
            db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64, toWH);
            db.AddInParameter(cmd, "@UoM_Number", DbType.Int64, uomNo);
            db.AddInParameter(cmd, "@JOFTIH_Number", DbType.Int64, headNo > 0 ? (object)headNo : DBNull.Value);
            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region Vendor Address (JWV_Address)

        public DataSet GetVendorAddressDB(long vendorNo, long? adtpNo = null)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_FreightInvoice_VendorAddress_SP");
            db.AddInParameter(cmd, "@VendorNumber", DbType.Int64, vendorNo);
            db.AddInParameter(cmd, "@ADTP_Number", DbType.Int64, adtpNo.HasValue ? (object)adtpNo.Value : DBNull.Value);
            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region Page lookups

        // Currency, UoM, Warehouse, SAC, Process, WHT, AddressType, JOFRT SO list
        public DataSet FreightInvoiceLookupDB()
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_FreightInvoice_SP");
            db.AddInParameter(cmd, "@FRT_Id", DbType.Int32, 1);
            return db.ExecuteDataSet(cmd);
        }

        // Vendor-change / GST / WHT lookups - reuses JO_JobworkInvoice_SP (Ids 5,6,7,8,10,12)
        public DataSet VendorLookupDB(int id, DateTime? invDate = null, string search = null,
            long? vendorNo = null, long? tctNo = null, long? sacNo = null, long? whtNo = null)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_JobworkInvoice_SP");
            db.AddInParameter(cmd, "@JW_Inv_Id", DbType.Int32, id);
            db.AddInParameter(cmd, "@JOSVIH_VendorInvoiceDate", DbType.Date, invDate.HasValue ? (object)invDate.Value.Date : DBNull.Value);
            db.AddInParameter(cmd, "@Search", DbType.String, (object)search ?? DBNull.Value);
            db.AddInParameter(cmd, "@Vendor_Number", DbType.Int64, vendorNo.HasValue ? (object)vendorNo.Value : DBNull.Value);
            db.AddInParameter(cmd, "@TaxCluster_Number", DbType.Int64, tctNo.HasValue ? (object)tctNo.Value : DBNull.Value);
            db.AddInParameter(cmd, "@SAC_Number", DbType.Int64, sacNo.HasValue ? (object)sacNo.Value : DBNull.Value);
            db.AddInParameter(cmd, "@WHT_Number", DbType.Int64, whtNo.HasValue ? (object)whtNo.Value : DBNull.Value);
            return db.ExecuteDataSet(cmd);
        }

        #endregion
    }
}