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
    public class JO_JobworkInvoice_DAO
    {
        DBConnect DB = new DBConnect();

        #region Lookup SP (JO_JobworkInvoice_SP)  Id 1,5,6,7,8,10,12
        public DataSet JO_JobworkInvoiceDB(
            int id,
            DateTime? vendorInvoiceDate = null,
            string search = null,
            long? vendorNumber = null,
            long? taxClusterNumber = null,
            long? sacNumber = null,
            long? whtNumber = null)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_JobworkInvoice_SP");

            db.AddInParameter(cmd, "@JW_Inv_Id", DbType.Int32, id);
            db.AddInParameter(cmd, "@JOSVIH_VendorInvoiceDate", DbType.Date,
                vendorInvoiceDate.HasValue ? (object)vendorInvoiceDate.Value : DBNull.Value);
            db.AddInParameter(cmd, "@Search", DbType.String,
                search == null ? (object)DBNull.Value : search);
            db.AddInParameter(cmd, "@Vendor_Number", DbType.Int64,
                vendorNumber.HasValue ? (object)vendorNumber.Value : DBNull.Value);
            db.AddInParameter(cmd, "@TaxCluster_Number", DbType.Int64,
                taxClusterNumber.HasValue ? (object)taxClusterNumber.Value : DBNull.Value);
            db.AddInParameter(cmd, "@SAC_Number", DbType.Int64,
                sacNumber.HasValue ? (object)sacNumber.Value : DBNull.Value);
            db.AddInParameter(cmd, "@WHT_Number", DbType.Int64,
                whtNumber.HasValue ? (object)whtNumber.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region Receipt Note popup
        // RN list (one row per RN)
        public DataSet GetReceiptNote_GroupItem(long vendorNumber, long msNumber, long? josvihNumber = null)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_GroupItem_SP");

            db.AddInParameter(cmd, "@VendorNumber", DbType.Int64, vendorNumber);
            db.AddInParameter(cmd, "@MSNumber", DbType.Int64, msNumber);
            db.AddInParameter(cmd, "@JOSVIH_Number", DbType.Int64,
                josvihNumber.HasValue ? (object)josvihNumber.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        // RN items for the selected RNs (comma separated RN numbers)
        public DataSet GetReceiptNote_ForInvoice(long vendorNumber, string rnNumbers)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_ReceiptNote_ForInvoice_SP");

            db.AddInParameter(cmd, "@VendorNumber", DbType.Int64, vendorNumber);
            db.AddInParameter(cmd, "@RNNumbers", DbType.String, rnNumbers);

            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region Get (Edit / View) , Address , Summary , Detailed
        // 0 Header, 1 Items, 2 Address, 3 GST
        public DataSet GetJobworkInvoice(long josvihNumber)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_JobworkInvoice_Get_SP");
            db.AddInParameter(cmd, "@JOSVIH_Number", DbType.Int64, josvihNumber);
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetJobworkInvoiceAddressDB(long josvihNumber)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_JobworkInvoiceAddress_GetByJOSVIHNumber");
            db.AddInParameter(cmd, "@JOSVIH_Number", DbType.Int64, josvihNumber);
            return db.ExecuteDataSet(cmd);
        }
        public DataSet GetVendorAddressDB(long vendorNumber)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_JobworkInvoiceAddress_GetByVendor");
            db.AddInParameter(cmd, "@JWV_Number", DbType.Int64, vendorNumber);
            return db.ExecuteDataSet(cmd);
        }
        public DataSet GetJobworkInvoiceList()
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_JobworkInvoice_List_SP");
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetJobworkInvoiceListDetailed()
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_JobworkInvoice_ListDetailed_SP");
            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region INSERT (one transaction : Head -> Items -> GST -> Address)
        public long JobworkInvoiceInsertDB(JO_JobworkInvoiceCreate_DTO dto)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        long josvihNumber = HeadInsert(dto, con, tr);

                        DataTable insertedItems = ItemBulkInsert(josvihNumber, dto, con, tr);

                        GSTInsert(josvihNumber, insertedItems, dto, con, tr);

                        AddressInsert(josvihNumber, dto.Addresses, con, tr);

                        tr.Commit();
                        return josvihNumber;
                    }
                    catch (Exception)
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }
        }

        private long HeadInsert(JO_JobworkInvoiceCreate_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            var h = dto.Header;
            using (SqlCommand cmd = new SqlCommand("JO_JobworkInvoiceHead_Insert_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@JOSVIH_JournalNo", h.JOSVIH_JournalNo);
                cmd.Parameters.AddWithValue("@JOSVIH_JournalDate", h.JOSVIH_JournalDate);
                cmd.Parameters.AddWithValue("@JOSVIH_VendorInvoiceNo", h.JOSVIH_VendorInvoiceNo);
                cmd.Parameters.AddWithValue("@JOSVIH_VendorInvoiceDate", h.JOSVIH_VendorInvoiceDate);
                cmd.Parameters.AddWithValue("@JOSVIH_MS_Number", h.JOSVIH_MS_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_JW_Vendor_Number", h.JOSVIH_JW_Vendor_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_Currency_Number", h.JOSVIH_Currency_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_TCT_Number", h.JOSVIH_TCT_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_WHT_Number", h.JOSVIH_WHT_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_PaymentTerms", h.JOSVIH_PaymentTerms ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JOSVIH_PaymentMethod", h.JOSVIH_PaymentMethod ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JOSVIH_Remarks", h.JOSVIH_Remarks ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@CreatorCode", h.CreatorCode.HasValue ? (object)h.CreatorCode.Value : DBNull.Value);

                return Convert.ToInt64(cmd.ExecuteScalar());
            }
        }

        // TVP table - column ORDER must match dbo.JO_JobworkInvoiceItemType
        private DataTable BuildItemTable(long josvihNumber, List<JO_JobworkInvoiceItem_DTO> items)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("JOSVII_JOSVIH_Number", typeof(long));
            dt.Columns.Add("JOSVII_Number", typeof(long));
            dt.Columns.Add("JOSVII_JORNH_Number", typeof(long));
            dt.Columns.Add("JOSVII_JORNI_Number", typeof(long));
            dt.Columns.Add("JOSVII_JOJWI_SVOH_Number", typeof(long));
            dt.Columns.Add("JOSVII_JOJWI_SVOI_Number", typeof(long));
            dt.Columns.Add("JOSVII_Vendor_DN_No", typeof(string));
            dt.Columns.Add("JOSVII_JPRS_Number", typeof(long));
            dt.Columns.Add("JOSVII_Item_Number", typeof(long));
            dt.Columns.Add("JOSVII_UoM_Number", typeof(long));
            dt.Columns.Add("JOSVII_Qty", typeof(double));
            dt.Columns.Add("JOSVII_UnitPrice", typeof(double));
            dt.Columns.Add("JOSVII_Amount", typeof(double));
            dt.Columns.Add("JOSVII_SAC_Number", typeof(long));
            dt.Columns.Add("JOSVII_GST_Amount", typeof(double));
            dt.Columns.Add("JOSVII_WHT_Percent", typeof(double));
            dt.Columns.Add("JOSVII_WH_TaxAmount", typeof(double));

            foreach (var i in items)
            {
                dt.Rows.Add(
                    josvihNumber,
                    i.JOSVII_Number,
                    i.JOSVII_JORNH_Number,
                    i.JOSVII_JORNI_Number,
                    i.JOSVII_JOJWI_SVOH_Number,
                    i.JOSVII_JOJWI_SVOI_Number,
                    i.JOSVII_Vendor_DN_No ?? (object)DBNull.Value,
                    i.JOSVII_JPRS_Number,
                    i.JOSVII_Item_Number,
                    i.JOSVII_UoM_Number,
                    i.JOSVII_Qty,
                    i.JOSVII_UnitPrice,
                    i.JOSVII_Amount,
                    i.JOSVII_SAC_Number,
                    i.JOSVII_GST_Amount,
                    i.JOSVII_WHT_Percent,
                    i.JOSVII_WH_TaxAmount);
            }
            return dt;
        }

        private DataTable ItemBulkInsert(long josvihNumber, JO_JobworkInvoiceCreate_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = BuildItemTable(josvihNumber, dto.Items);

            using (SqlCommand cmd = new SqlCommand("JO_JobworkInvoiceItem_BulkInsert_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@JOSVIH_Number", josvihNumber);

                SqlParameter tvp = cmd.Parameters.AddWithValue("@Items", dt);
                tvp.SqlDbType = SqlDbType.Structured;
                tvp.TypeName = "dbo.JO_JobworkInvoiceItemType";

                DataTable inserted = new DataTable();
                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    da.Fill(inserted);
                }
                return inserted;   // JOSVII_Number, JOSVII_JORNI_Number, JOSVII_SAC_Number, JOSVII_Amount
            }
        }

        // GST rows : calculated per item (cluster + SAC + Vendor Invoice Date)
        private void GSTInsert(long josvihNumber, DataTable items, JO_JobworkInvoiceCreate_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            foreach (DataRow row in items.Rows)
            {
                long itemNo = Convert.ToInt64(row["JOSVII_Number"]);
                long sacNo = Convert.ToInt64(row["JOSVII_SAC_Number"]);
                double amount = Convert.ToDouble(row["JOSVII_Amount"]);

                List<JO_JobworkInvoiceGstCalc_DTO> gstRows = CalculateGST(
                    dto.Header.JOSVIH_TCT_Number,
                    dto.Header.JOSVIH_VendorInvoiceDate,
                    sacNo,
                    amount);

                int gstIndex = 1;
                foreach (var gst in gstRows)
                {
                    using (SqlCommand cmd = new SqlCommand("JO_JobworkInvoiceGST_Insert_SP", con, tr))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@JOSVIG_JOSVIH_Number", josvihNumber);
                        cmd.Parameters.AddWithValue("@JOSVIG_JOSVII_Number", itemNo);
                        cmd.Parameters.AddWithValue("@JOSVIG_Index", gstIndex);
                        cmd.Parameters.AddWithValue("@JOSVIG_GSTC_Number", gst.GSTCNumber ?? 0);
                        cmd.Parameters.AddWithValue("@JOSVIG_GSTT_Number", gst.GSTTNumber ?? 0);
                        cmd.Parameters.AddWithValue("@JOSVIG_GSTE_Number", gst.GSTENumber ?? 0);
                        cmd.Parameters.AddWithValue("@JOSVIG_AssessableValue", gst.AssessableValue);
                        cmd.Parameters.AddWithValue("@JOSVIG_Percent", gst.Percentage ?? 0);
                        cmd.Parameters.AddWithValue("@JOSVIG_GST_Amount", gst.Amount);
                        cmd.ExecuteNonQuery();
                    }
                    gstIndex++;
                }
            }
        }

        private void AddressInsert(long josvihNumber, List<JO_JobworkInvoiceAddress_DTO> addressList, SqlConnection con, SqlTransaction tr)
        {
            if (addressList == null) return;

            foreach (var a in addressList)
            {
                using (SqlCommand cmd = new SqlCommand("JO_JobworkInvoiceAddress_Insert_SP", con, tr))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@JOSVIA_JOSVIH_Number", josvihNumber);
                    cmd.Parameters.AddWithValue("@JOSVIA_ADTP_Number", a.JOSVIA_ADTP_Number);
                    cmd.Parameters.AddWithValue("@JOSVIA_Address_ID", a.JOSVIA_Address_ID);
                    cmd.Parameters.AddWithValue("@JOSVIA_Address", a.JOSVIA_Address ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@JOSVIA_City", a.JOSVIA_City ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@JOSVIA_State", a.JOSVIA_State ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@JOSVIA_Country", a.JOSVIA_Country ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@JOSVIA_PIN", a.JOSVIA_PIN ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@JOSVIA_GSTIN", a.JOSVIA_GSTIN ?? (object)DBNull.Value);
                    cmd.ExecuteNonQuery();
                }
            }
        }
        #endregion

        #region UPDATE (one transaction : Head -> Items(+GST reset) -> GST -> Address)
        public void JobworkInvoiceUpdateDB(JO_JobworkInvoiceCreate_DTO dto)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        long josvihNumber = dto.Header.JOSVIH_Number;

                        HeadUpdate(dto, con, tr);

                        DataTable finalItems = ItemBulkUpdate(josvihNumber, dto, con, tr);

                        // GST rebuilt (old rows were deleted inside BulkUpdate SP)
                        GSTInsert(josvihNumber, finalItems, dto, con, tr);

                        AddressUpdate(josvihNumber, dto, con, tr);

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

        private void HeadUpdate(JO_JobworkInvoiceCreate_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            var h = dto.Header;
            using (SqlCommand cmd = new SqlCommand("JO_JobworkInvoiceHead_Update_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@JOSVIH_Number", h.JOSVIH_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_JournalNo", h.JOSVIH_JournalNo);
                cmd.Parameters.AddWithValue("@JOSVIH_JournalDate", h.JOSVIH_JournalDate);
                cmd.Parameters.AddWithValue("@JOSVIH_VendorInvoiceNo", h.JOSVIH_VendorInvoiceNo);
                cmd.Parameters.AddWithValue("@JOSVIH_VendorInvoiceDate", h.JOSVIH_VendorInvoiceDate);
                cmd.Parameters.AddWithValue("@JOSVIH_MS_Number", h.JOSVIH_MS_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_JW_Vendor_Number", h.JOSVIH_JW_Vendor_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_Currency_Number", h.JOSVIH_Currency_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_TCT_Number", h.JOSVIH_TCT_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_WHT_Number", h.JOSVIH_WHT_Number);
                cmd.Parameters.AddWithValue("@JOSVIH_PaymentTerms", h.JOSVIH_PaymentTerms ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JOSVIH_PaymentMethod", h.JOSVIH_PaymentMethod ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@JOSVIH_Remarks", h.JOSVIH_Remarks ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@EditorCode", h.EditorCode.HasValue ? (object)h.EditorCode.Value : DBNull.Value);

                cmd.ExecuteNonQuery();
            }
        }

        private DataTable ItemBulkUpdate(long josvihNumber, JO_JobworkInvoiceCreate_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = BuildItemTable(josvihNumber, dto.Items);

            using (SqlCommand cmd = new SqlCommand("JO_JobworkInvoiceItem_BulkUpdate_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@JOSVIH_Number", josvihNumber);

                SqlParameter tvp = cmd.Parameters.AddWithValue("@Items", dt);
                tvp.SqlDbType = SqlDbType.Structured;
                tvp.TypeName = "dbo.JO_JobworkInvoiceItemType";

                DataTable finalItems = new DataTable();
                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    da.Fill(finalItems);
                }
                return finalItems;
            }
        }

        private void AddressUpdate(long josvihNumber, JO_JobworkInvoiceCreate_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("JOSVIA_JOSVIH_Number", typeof(long));
            dt.Columns.Add("JOSVIA_ADTP_Number", typeof(long));
            dt.Columns.Add("JOSVIA_Address_ID", typeof(string));
            dt.Columns.Add("JOSVIA_Address", typeof(string));
            dt.Columns.Add("JOSVIA_City", typeof(string));
            dt.Columns.Add("JOSVIA_State", typeof(string));
            dt.Columns.Add("JOSVIA_Country", typeof(string));
            dt.Columns.Add("JOSVIA_PIN", typeof(string));
            dt.Columns.Add("JOSVIA_GSTIN", typeof(string));

            if (dto.Addresses != null)
            {
                foreach (var a in dto.Addresses)
                {
                    dt.Rows.Add(
                        josvihNumber,
                        a.JOSVIA_ADTP_Number,
                        a.JOSVIA_Address_ID,
                        a.JOSVIA_Address ?? (object)DBNull.Value,
                        a.JOSVIA_City ?? (object)DBNull.Value,
                        a.JOSVIA_State ?? (object)DBNull.Value,
                        a.JOSVIA_Country ?? (object)DBNull.Value,
                        a.JOSVIA_PIN ?? (object)DBNull.Value,
                        a.JOSVIA_GSTIN ?? (object)DBNull.Value);
                }
            }

            using (SqlCommand cmd = new SqlCommand("JO_JobworkInvoiceAddress_Update_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@JOSVIA_JOSVIH_Number", josvihNumber);

                SqlParameter tvp = cmd.Parameters.AddWithValue("@Address", dt);
                tvp.SqlDbType = SqlDbType.Structured;
                tvp.TypeName = "dbo.JO_JobworkInvoiceAddressType";

                cmd.ExecuteNonQuery();
            }
        }
        #endregion

        #region GST calculation (same algorithm as old Jobwork Invoice, SAC based)
        public List<JO_JobworkInvoiceGstCalc_DTO> GstCalcView(DataTable dt)
        {
            List<JO_JobworkInvoiceGstCalc_DTO> list = new List<JO_JobworkInvoiceGstCalc_DTO>();

            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_JobworkInvoiceGstCalc_DTO
                {
                    TaxIndex = Convert.ToInt64(dr["TaxIndex"]),
                    GSTCNumber = dt.Columns.Contains("GSTCNumber") && dr["GSTCNumber"] != DBNull.Value ? Convert.ToInt64(dr["GSTCNumber"]) : 0,
                    GSTTNumber = dt.Columns.Contains("GSTTNumber") && dr["GSTTNumber"] != DBNull.Value ? Convert.ToInt64(dr["GSTTNumber"]) : 0,
                    GSTENumber = dt.Columns.Contains("GSTENumber") && dr["GSTENumber"] != DBNull.Value ? Convert.ToInt64(dr["GSTENumber"]) : 0,
                    TaxCategory = Convert.ToString(dr["TaxCategory"]),
                    TaxType = Convert.ToString(dr["TaxType"]),
                    TaxElement = Convert.ToString(dr["TaxElement"]),
                    TaxElementName = Convert.ToString(dr["TaxElementName"]),
                    LoadonInventory = Convert.ToString(dr["LoadonInventory"]),
                    LoadonInventoryPercent = Convert.ToString(dr["LoadonInventoryPercent"]),
                    Chargeable = Convert.ToString(dr["Chargeable"]),
                    Calculation = Convert.ToInt64(dr["Calculation"]),
                    Percentage = dr["Percentage"] == DBNull.Value ? (double?)null : Convert.ToDouble(dr["Percentage"])
                });
            }
            return list;
        }

        public List<JO_JobworkInvoiceGstCalc_DTO> CalculateGST(long cluster, DateTime vendorInvoiceDate, long sacNo, double baseAmount)
        {
            // SP Id 12 : rows with names (cluster + SAC + date)
            DataTable dt = JO_JobworkInvoiceDB(12, vendorInvoiceDate, null, null, cluster, sacNo, null).Tables[0];

            List<JO_JobworkInvoiceGstCalc_DTO> result = new List<JO_JobworkInvoiceGstCalc_DTO>();
            var groupTotals = new Dictionary<long, double>();

            var gstList = GstCalcView(dt);
            if (gstList == null || !gstList.Any())
                return result;

            foreach (var group in gstList.GroupBy(g => Convert.ToInt64(g.TaxIndex)))
            {
                double groupTotal = 0;
                double groupAssessable = 0;

                var calcOne = group.Where(x => Convert.ToInt32(x.Calculation) == 1).ToList();
                if (!calcOne.Any())
                    continue;

                var first = calcOne.First();
                long taxElement = Convert.ToInt64(first.TaxElement);

                foreach (var item in group)
                {
                    int calculation = Convert.ToInt32(item.Calculation);
                    int chargeable = Convert.ToInt32(item.Chargeable);

                    // first level tax (on base amount)
                    if (chargeable == 4 && calculation == 1)
                    {
                        if (item.Percentage.HasValue)
                        {
                            groupTotal += baseAmount * (item.Percentage.Value / 100);
                            groupAssessable += baseAmount;
                        }
                    }
                    // second level tax (on previous element's tax)
                    else if (calculation == 0)
                    {
                        long el = Convert.ToInt64(item.TaxElement);
                        if (groupTotals.ContainsKey(el) && item.Percentage.HasValue)
                        {
                            double baseElementValue = groupTotals[el];
                            groupTotal += baseElementValue * (item.Percentage.Value / 100);
                            groupAssessable += baseElementValue;
                        }
                    }
                }

                result.Add(new JO_JobworkInvoiceGstCalc_DTO
                {
                    TaxIndex = group.Key,
                    GSTCNumber = first.GSTCNumber ?? 0,
                    GSTTNumber = first.GSTTNumber ?? 0,
                    GSTENumber = first.GSTENumber ?? 0,
                    Percentage = first.Percentage ?? 0,

                    // GST popup display columns
                    TaxCategory = first.TaxCategory,
                    TaxType = first.TaxType,
                    TaxElementName = first.TaxElementName,
                    LoadonInventory = first.LoadonInventory == "1" ? "Yes" : "No",
                    LoadonInventoryPercent = first.LoadonInventoryPercent,

                    AssessableValue = groupAssessable,
                    Amount = groupTotal
                });

                groupTotals[taxElement] = groupTotal;
            }

            return result;
        }
        #endregion
    }
}