using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO.JobInwardTransaction
{
    public class RNNumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();
        public DataSet RNNumberDB(RNNumber_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("RNNumbering_SP");
            Db.AddInParameter(DbC, "@RNN_Number", DbType.Int64, P_DTO.RNN_Number);
            Db.AddInParameter(DbC, "@RNN_Method", DbType.Int64, P_DTO.RNN_Method);
            Db.AddInParameter(DbC, "@RNN_Date", DbType.Int32, P_DTO.RNN_Date);
            Db.AddInParameter(DbC, "@RNN_EndDate", DbType.Int32, P_DTO.RNN_EndDate);
            Db.AddInParameter(DbC, "@RNN_StartingNumber", DbType.Int32, P_DTO.RNN_StartingNumber);
            Db.AddInParameter(DbC, "@RNN_NumberofDigits", DbType.Int32, P_DTO.RNN_NumberofDigits);
            Db.AddInParameter(DbC, "@RNN_PrefilZero", DbType.Int64, P_DTO.RNN_PrefilZero);
            Db.AddInParameter(DbC, "@RNN_Frequency", DbType.Int64, P_DTO.RNN_Frequency);
            Db.AddInParameter(DbC, "@RNN_Particulars", DbType.String, P_DTO.RNN_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);
            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
       
    }

    public class DNNumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet DNNumberDB(DNNumber_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("DNNumbering_SP");

            Db.AddInParameter(DbC, "@DNN_Number", DbType.Int64, P_DTO.DNN_Number);
            Db.AddInParameter(DbC, "@DNN_Method", DbType.Int64, P_DTO.DNN_Method);
            Db.AddInParameter(DbC, "@DNN_Date", DbType.Int32, P_DTO.DNN_Date);
            Db.AddInParameter(DbC, "@DNN_EndDate", DbType.Int32, P_DTO.DNN_EndDate);
            Db.AddInParameter(DbC, "@DNN_StartingNumber", DbType.Int32, P_DTO.DNN_StartingNumber);
            Db.AddInParameter(DbC, "@DNN_NumberofDigits", DbType.Int32, P_DTO.DNN_NumberofDigits);
            Db.AddInParameter(DbC, "@DNN_PrefilZero", DbType.Int64, P_DTO.DNN_PrefilZero);
            Db.AddInParameter(DbC, "@DNN_Frequency", DbType.Int64, P_DTO.DNN_Frequency);
            Db.AddInParameter(DbC, "@DNN_Particulars", DbType.String, P_DTO.DNN_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }
    public class JINumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JINumberDB(JINumber_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JINumbering_SP");

            Db.AddInParameter(DbC, "@JIN_Number", DbType.Int64, P_DTO.JIN_Number);
            Db.AddInParameter(DbC, "@JIN_Method", DbType.Int64, P_DTO.JIN_Method);
            Db.AddInParameter(DbC, "@JIN_Date", DbType.Int32, P_DTO.JIN_Date);
            Db.AddInParameter(DbC, "@JIN_EndDate", DbType.Int32, P_DTO.JIN_EndDate);
            Db.AddInParameter(DbC, "@JIN_StartingNumber", DbType.Int32, P_DTO.JIN_StartingNumber);
            Db.AddInParameter(DbC, "@JIN_NumberofDigits", DbType.Int32, P_DTO.JIN_NumberofDigits);
            Db.AddInParameter(DbC, "@JIN_PrefilZero", DbType.Int64, P_DTO.JIN_PrefilZero);
            Db.AddInParameter(DbC, "@JIN_Frequency", DbType.Int64, P_DTO.JIN_Frequency);
            Db.AddInParameter(DbC, "@JIN_Particulars", DbType.String, P_DTO.JIN_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }

    public class JSONumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JSONumberDB(JSONumber_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JSONumbering_SP");

            Db.AddInParameter(DbC, "@JSON_Number", DbType.Int64, P_DTO.JSON_Number);
            Db.AddInParameter(DbC, "@JSON_Method", DbType.Int64, P_DTO.JSON_Method);
            Db.AddInParameter(DbC, "@JSON_Date", DbType.Int32, P_DTO.JSON_Date);
            Db.AddInParameter(DbC, "@JSON_EndDate", DbType.Int32, P_DTO.JSON_EndDate);
            Db.AddInParameter(DbC, "@JSON_StartingNumber", DbType.Int32, P_DTO.JSON_StartingNumber);
            Db.AddInParameter(DbC, "@JSON_NumberofDigits", DbType.Int32, P_DTO.JSON_NumberofDigits);
            Db.AddInParameter(DbC, "@JSON_PrefilZero", DbType.Int64, P_DTO.JSON_PrefilZero);
            Db.AddInParameter(DbC, "@JSON_Frequency", DbType.Int64, P_DTO.JSON_Frequency);
            Db.AddInParameter(DbC, "@JSON_Particulars", DbType.String, P_DTO.JSON_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }
    public class JI_CONVNumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_CONVNumberDB(JI_CONVNumber_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JI_CONVNumbering_SP");

            Db.AddInParameter(DbC, "@JICN_Number", DbType.Int64, P_DTO.JICN_Number);
            Db.AddInParameter(DbC, "@JICN_Method", DbType.Int64, P_DTO.JICN_Method);
            Db.AddInParameter(DbC, "@JICN_Date", DbType.Int32, P_DTO.JICN_Date);
            Db.AddInParameter(DbC, "@JICN_EndDate", DbType.Int32, P_DTO.JICN_EndDate);
            Db.AddInParameter(DbC, "@JICN_StartingNumber", DbType.Int32, P_DTO.JICN_StartingNumber);
            Db.AddInParameter(DbC, "@JICN_NumberofDigits", DbType.Int32, P_DTO.JICN_NumberofDigits);
            Db.AddInParameter(DbC, "@JICN_PrefilZero", DbType.Int64, P_DTO.JICN_PrefilZero);
            Db.AddInParameter(DbC, "@JICN_Frequency", DbType.Int64, P_DTO.JICN_Frequency);
            Db.AddInParameter(DbC, "@JICN_Particulars", DbType.String, P_DTO.JICN_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }
}
