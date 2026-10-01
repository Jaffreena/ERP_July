using ERP_DTO.JobOutwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JW_Vendor_DAO
    {
        DBConnect DB = new DBConnect();

        public DataSet JW_VendorDB(JW_Vendor_DTO B_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JW_Vendor_SP");

            // Head
            Db.AddInParameter(DbC, "@JWV_Number", DbType.Int64, B_DTO.JWV_Number);
            Db.AddInParameter(DbC, "@JWV_JW_VendorName", DbType.String, B_DTO.JWV_JW_VendorName);
            Db.AddInParameter(DbC, "@JWV_JVG_Number", DbType.Int64, B_DTO.JWV_JVG_Number);
            Db.AddInParameter(DbC, "@JWV_JVC_Number", DbType.Int64, B_DTO.JWV_JVC_Number);
            Db.AddInParameter(DbC, "@JWV_WH_Number", DbType.Int64, B_DTO.JWV_WH_Number);
            Db.AddInParameter(DbC, "@JWV_PaymentTerms", DbType.String, B_DTO.JWV_PaymentTerms);
            Db.AddInParameter(DbC, "@JWV_PaymentMode", DbType.String, B_DTO.JWV_PaymentMode);
            Db.AddInParameter(DbC, "@JWV_CreditDays", DbType.Int32, B_DTO.JWV_CreditDays);
            Db.AddInParameter(DbC, "@JWV_Currency_Number", DbType.Int64, B_DTO.JWV_Currency_Number);
            Db.AddInParameter(DbC, "@JWV_AccountName", DbType.String, B_DTO.JWV_AccountName);
            Db.AddInParameter(DbC, "@JWV_AccountNumber", DbType.String, B_DTO.JWV_AccountNumber);
            Db.AddInParameter(DbC, "@JWV_IFSC", DbType.String, B_DTO.JWV_IFSC);
            Db.AddInParameter(DbC, "@JWV_BankName", DbType.String, B_DTO.JWV_BankName);
            Db.AddInParameter(DbC, "@JWV_RT_Number", DbType.Int64, B_DTO.JWV_RT_Number);
            Db.AddInParameter(DbC, "@JWV_GSTIN", DbType.String, B_DTO.JWV_GSTIN);
            Db.AddInParameter(DbC, "@JWV_AT_Number", DbType.Int64, B_DTO.JWV_AT_Number);
            Db.AddInParameter(DbC, "@JWV_TransportAgency", DbType.Int16, B_DTO.JWV_TransportAgency);
            Db.AddInParameter(DbC, "@JWV_TransporterID", DbType.String, B_DTO.JWV_TransporterID);
            Db.AddInParameter(DbC, "@JWV_PAN", DbType.String, B_DTO.JWV_PAN);
            Db.AddInParameter(DbC, "@JWV_WithholdTax", DbType.Int16, B_DTO.JWV_WithholdTax);
            Db.AddInParameter(DbC, "@JWV_AN_Number", DbType.Int64, B_DTO.JWV_AN_Number);

            // WHT grid
            Db.AddInParameter(DbC, "@JWV_WHT_Number", DbType.Int64, B_DTO.JWV_WHT_Number);
            Db.AddInParameter(DbC, "@JWV_WHT_WHTC_Number", DbType.Int64, B_DTO.JWV_WHT_WHTC_Number);
            Db.AddInParameter(DbC, "@JWV_WHT_WHTT_Number", DbType.Int64, B_DTO.JWV_WHT_WHTT_Number);
            Db.AddInParameter(DbC, "@JWV_WHT_WHT_Number", DbType.Int64, B_DTO.JWV_WHT_WHT_Number);
            Db.AddInParameter(DbC, "@JWV_WHT_FromDate", DbType.String, NullIfEmpty(B_DTO.JWV_WHT_FromDate));
            Db.AddInParameter(DbC, "@JWV_WHT_ToDate", DbType.String, NullIfEmpty(B_DTO.JWV_WHT_ToDate));

            // GST grid
            Db.AddInParameter(DbC, "@JWV_GST_Number", DbType.Int64, B_DTO.JWV_GST_Number);
            Db.AddInParameter(DbC, "@JWV_GST_GSTC_Number", DbType.Int64, B_DTO.JWV_GST_GSTC_Number);
            Db.AddInParameter(DbC, "@JWV_GST_GSTT_Number", DbType.Int64, B_DTO.JWV_GST_GSTT_Number);
            Db.AddInParameter(DbC, "@JWV_GST_TCT_Number", DbType.Int64, B_DTO.JWV_GST_TCT_Number);
            Db.AddInParameter(DbC, "@JWV_GST_FromDate", DbType.String, NullIfEmpty(B_DTO.JWV_GST_FromDate));
            Db.AddInParameter(DbC, "@JWV_GST_ToDate", DbType.String, NullIfEmpty(B_DTO.JWV_GST_ToDate));

            // Address grid
            Db.AddInParameter(DbC, "@JWV_ADD_Number", DbType.Int64, B_DTO.JWV_ADD_Number);
            Db.AddInParameter(DbC, "@JWV_ADD_ADTP_Number", DbType.Int64, B_DTO.JWV_ADD_ADTP_Number);
            Db.AddInParameter(DbC, "@JWV_ADD_Address_ID", DbType.String, B_DTO.JWV_ADD_Address_ID);
            Db.AddInParameter(DbC, "@JWV_ADD_Address", DbType.String, B_DTO.JWV_ADD_Address);
            Db.AddInParameter(DbC, "@JWV_ADD_City", DbType.String, B_DTO.JWV_ADD_City);
            Db.AddInParameter(DbC, "@JWV_ADD_State", DbType.String, B_DTO.JWV_ADD_State);
            Db.AddInParameter(DbC, "@JWV_ADD_Country", DbType.String, B_DTO.JWV_ADD_Country);
            Db.AddInParameter(DbC, "@JWV_ADD_PIN", DbType.String, B_DTO.JWV_ADD_PIN);
            Db.AddInParameter(DbC, "@JWV_ADD_GSTIN", DbType.String, B_DTO.JWV_ADD_GSTIN);
            Db.AddInParameter(DbC, "@JWV_ADD_Default", DbType.Int16, B_DTO.JWV_ADD_Default);

            // Contact grid
            Db.AddInParameter(DbC, "@JWV_CNT_Number", DbType.Int64, B_DTO.JWV_CNT_Number);
            Db.AddInParameter(DbC, "@JWV_CNT_ContactName", DbType.String, B_DTO.JWV_CNT_ContactName);
            Db.AddInParameter(DbC, "@JWV_CNT_Department", DbType.String, B_DTO.JWV_CNT_Department);
            Db.AddInParameter(DbC, "@JWV_CNT_Mobile", DbType.String, B_DTO.JWV_CNT_Mobile);
            Db.AddInParameter(DbC, "@JWV_CNT_Telephone", DbType.String, B_DTO.JWV_CNT_Telephone);
            Db.AddInParameter(DbC, "@JWV_CNT_Email", DbType.String, B_DTO.JWV_CNT_Email);

            // Common
            Db.AddInParameter(DbC, "@JWV_DeleteNumbers", DbType.String, B_DTO.JWV_DeleteNumbers);
            Db.AddInParameter(DbC, "@JWV_CreatorCode", DbType.Int64, B_DTO.JWV_CreatorCode);
            Db.AddInParameter(DbC, "@JWV_Id", DbType.Int32, B_DTO.JWV_Id);

            // AJAX filters
            Db.AddInParameter(DbC, "@WH_TaxCategory", DbType.String, B_DTO.WH_TaxCategory);
            Db.AddInParameter(DbC, "@WH_TaxType", DbType.String, B_DTO.WH_TaxType);
            Db.AddInParameter(DbC, "@GST_Category", DbType.String, B_DTO.GST_Category);
            Db.AddInParameter(DbC, "@GST_Type", DbType.String, B_DTO.GST_Type);

            return Db.ExecuteDataSet(DbC);
        }

        static string? NullIfEmpty(string? s)
        {
            return string.IsNullOrWhiteSpace(s) ? null : s;
        }
    }
}
