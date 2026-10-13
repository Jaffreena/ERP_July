using ERP_DTO.JobOutwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JOJWI_Numbering_DAO
    {
        DBConnect DB = new DBConnect();

        static int I(string? s) => int.TryParse(s, out var v) ? v : 0;
        static long Lg(string? s) => long.TryParse(s, out var v) ? v : 0;

        // setup SP : Id 1 load, 11-14 insert, 31-33 delete, 41-44 update, 51-53 overlap check
        public DataSet JOJWI_NumberingDB(JOJWI_Numbering_DTO d)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_JobworkInvoice_Numbering_SP");

            db.AddInParameter(cmd, "@JOJWI_Number", DbType.Int64, d.JOJWI_Number);
            db.AddInParameter(cmd, "@JOJWI_Method", DbType.Int64, Lg(d.JOJWI_Method));
            db.AddInParameter(cmd, "@JOJWI_Date", DbType.Int32, I(d.JOJWI_Date));
            db.AddInParameter(cmd, "@JOJWI_EndDate", DbType.Int32, I(d.JOJWI_EndDate));
            db.AddInParameter(cmd, "@JOJWI_StartingNumber", DbType.Int32, I(d.JOJWI_StartingNumber));
            db.AddInParameter(cmd, "@JOJWI_NumberofDigits", DbType.Int32, I(d.JOJWI_NumberofDigits));
            db.AddInParameter(cmd, "@JOJWI_PrefilZero", DbType.Int64, Lg(d.JOJWI_PrefilZero));
            db.AddInParameter(cmd, "@JOJWI_Frequency", DbType.Int64, Lg(d.JOJWI_Frequency));
            db.AddInParameter(cmd, "@JOJWI_Particulars", DbType.String, (object?)d.JOJWI_Particulars ?? DBNull.Value);
            db.AddInParameter(cmd, "@DeleteNumbers", DbType.String, (object?)d.DeleteNumbers ?? DBNull.Value);
            db.AddInParameter(cmd, "@CreatorCode", DbType.Int32, d.CreatorCode);
            db.AddInParameter(cmd, "@Id", DbType.Int32, d.Id);

            return db.ExecuteDataSet(cmd);
        }

        // next Journal No (MAX+1) = Prefix + number + Suffix
        // throws if no numbering config covers the date
        public string JOJWI_NextJournalNo(DateTime journalDate)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            using (SqlCommand cmd = new SqlCommand("JO_JobworkInvoice_GetNextNumber_SP", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", 101);
                cmd.Parameters.AddWithValue("@JournalDate", journalDate.Date);

                var pNext = new SqlParameter("@NextNumber", SqlDbType.Int) { Direction = ParameterDirection.Output };
                var pPre = new SqlParameter("@Prefix", SqlDbType.VarChar, 30) { Direction = ParameterDirection.Output };
                var pSuf = new SqlParameter("@Suffix", SqlDbType.VarChar, 30) { Direction = ParameterDirection.Output };
                var pDig = new SqlParameter("@NumberOfDigits", SqlDbType.Int) { Direction = ParameterDirection.Output };
                var pZero = new SqlParameter("@PrefilZero", SqlDbType.Bit) { Direction = ParameterDirection.Output };
                cmd.Parameters.AddRange(new[] { pNext, pPre, pSuf, pDig, pZero });

                con.Open();
                cmd.ExecuteNonQuery();

                int next = Convert.ToInt32(pNext.Value);
                string prefix = pPre.Value == DBNull.Value ? "" : Convert.ToString(pPre.Value) ?? "";
                string suffix = pSuf.Value == DBNull.Value ? "" : Convert.ToString(pSuf.Value) ?? "";
                int digits = pDig.Value == DBNull.Value ? 0 : Convert.ToInt32(pDig.Value);
                bool zero = pZero.Value != DBNull.Value && Convert.ToBoolean(pZero.Value);

                return prefix + (zero ? next.ToString("D" + digits) : next.ToString()) + suffix;
            }
        }
    }
}